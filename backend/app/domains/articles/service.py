from __future__ import annotations

import uuid
from datetime import date

from pydantic import ValidationError
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, NotFoundError
from app.db.base import utcnow
from app.domains.articles.models import Article
from app.domains.articles.schemas import (
    ArticleContent,
    ArticleCreate,
    ArticleExerciseCheckResponse,
    ArticleRead,
    ArticleUpdate,
)
from app.domains.progress.service import record_article_exercise_attempt
from app.domains.solutions.service import normalize_answer
from app.domains.subjects.models import Subject
from app.domains.subjects.service import get_subject_by_slug


def _base_query():
    return select(Article).where(Article.is_published.is_(True))


def _dump_blocks(blocks) -> list[dict]:
    return [block.model_dump(mode="json") for block in blocks]


async def _resolve_subject(session: AsyncSession, slug: str | None) -> Subject | None:
    if slug is None:
        return None
    return await get_subject_by_slug(session, slug)


async def list_articles(
    session: AsyncSession, *, subject_slug: str | None = None
) -> list[ArticleRead]:
    pass
    query = _base_query().order_by(Article.published_on.desc().nullslast(), Article.id.desc())
    if subject_slug is not None:
        query = query.where(Article.subject.has(slug=subject_slug))
    rows = (await session.scalars(query)).all()
    return [ArticleRead.from_article(article) for article in rows]


async def count_published_articles(
    session: AsyncSession, *, subject_slug: str | None = None
) -> int:
    query = select(func.count()).select_from(Article).where(Article.is_published.is_(True))
    if subject_slug is not None:
        query = query.where(Article.subject.has(slug=subject_slug))
    return int(await session.scalar(query) or 0)


async def list_published_page(
    session: AsyncSession,
    *,
    subject_slug: str | None = None,
    limit: int = 10,
    offset: int = 0,
) -> list[ArticleRead]:
    query = _base_query().order_by(Article.published_on.desc().nullslast(), Article.id.desc())
    if subject_slug is not None:
        query = query.where(Article.subject.has(slug=subject_slug))
    rows = (await session.scalars(query.limit(limit).offset(offset))).all()
    return [ArticleRead.from_article(article) for article in rows]


async def get_article_by_slug(session: AsyncSession, slug: str) -> Article:
    article = await session.scalar(_base_query().where(Article.slug == slug))
    if article is None:
        raise NotFoundError(f"Статья «{slug}» не найдена.")
    return article


async def get_article_for_editor(session: AsyncSession, article_id: int) -> Article:
    article = await session.scalar(select(Article).where(Article.id == article_id))
    if article is None:
        raise NotFoundError(f"Статья #{article_id} не найдена.")
    return article


async def _ensure_slug_available(
    session: AsyncSession, slug: str, *, exclude_id: int | None = None
) -> None:
    query = select(Article.id).where(Article.slug == slug)
    if exclude_id is not None:
        query = query.where(Article.id != exclude_id)
    if await session.scalar(query) is not None:
        raise ConflictError(f"Статья со slug «{slug}» уже существует.")


async def create_draft(session: AsyncSession, payload: ArticleCreate) -> Article:
    await _ensure_slug_available(session, payload.slug)
    subject = await _resolve_subject(session, payload.subject)

    article = Article(
        slug=payload.slug,
        title=payload.title,
        description=payload.description,
        subject=subject,
        exam=payload.exam,
        reading_minutes=payload.reading_minutes,
        blocks=_dump_blocks(payload.blocks),
        content=payload.content.model_dump(mode="json") if payload.content else None,
        content_version=payload.content.version if payload.content else None,
        is_published=False,
    )
    session.add(article)
    await session.flush()
    return article


async def update_draft(session: AsyncSession, article_id: int, payload: ArticleUpdate) -> Article:
    article = await get_article_for_editor(session, article_id)
    if article.is_published:
        raise ConflictError(
            "Опубликованную статью нельзя изменить через черновик. Сначала снимите её с публикации."
        )

    provided = payload.model_fields_set

    if "slug" in provided and payload.slug is not None and payload.slug != article.slug:
        await _ensure_slug_available(session, payload.slug, exclude_id=article.id)
        article.slug = payload.slug
    if "title" in provided and payload.title is not None:
        article.title = payload.title
    if "description" in provided and payload.description is not None:
        article.description = payload.description
    if "subject" in provided:
        article.subject = await _resolve_subject(session, payload.subject)
    if "exam" in provided and payload.exam is not None:
        article.exam = payload.exam
    if "reading_minutes" in provided and payload.reading_minutes is not None:
        article.reading_minutes = payload.reading_minutes
    if "blocks" in provided:
        article.blocks = _dump_blocks(payload.blocks or [])
    if "content" in provided:
        if payload.content is None:
            article.content = None
            article.content_version = None
        else:
            article.content = payload.content.model_dump(mode="json")
            article.content_version = payload.content.version

    article.updated_on = date.today()
    await session.flush()
    return article


async def publish_article(session: AsyncSession, article_id: int) -> Article:
    article = await get_article_for_editor(session, article_id)
    if article.is_published:
        raise ConflictError("Статья уже опубликована.")
    if article.content is not None:
        try:
            ArticleContent.model_validate(article.content)
        except ValidationError as exc:
            raise ConflictError("Сохранённый контент не соответствует контракту.") from exc
    elif not article.blocks:
        raise ConflictError("Нечего публиковать: добавьте контент статьи.")

    article.is_published = True
    article.published_on = article.published_on or date.today()
    article.updated_on = date.today()
    await session.flush()
    return article


async def unpublish_article(session: AsyncSession, article_id: int) -> Article:
    article = await get_article_for_editor(session, article_id)
    if not article.is_published:
        raise ConflictError("Статья не опубликована.")

    article.is_published = False
    article.updated_on = date.today()
    await session.flush()
    return article


def _find_exercise(content: ArticleContent, exercise_id: str):
    for block in content.blocks:
        if block.id == exercise_id:
            return block
    return None


def _numeric_matches(answer: str, correct: float, tolerance: float) -> bool:
    normalized = normalize_answer(answer)
    try:
        value = float(normalized)
    except TypeError, ValueError:
        return False
    return abs(value - correct) <= tolerance


def _text_matches(answer: str, correct: str, case_sensitive: bool) -> bool:
    def normalize(value: str) -> str:
        cleaned = " ".join(value.strip().split())
        return cleaned if case_sensitive else cleaned.lower()

    return normalize(answer) == normalize(correct)


async def check_article_exercise(
    session: AsyncSession,
    *,
    article: Article,
    exercise_id: str,
    answer: str,
    user_id: uuid.UUID | None,
) -> ArticleExerciseCheckResponse:
    pass
    if article.content is None:
        raise NotFoundError("В статье нет упражнений.")
    try:
        content = ArticleContent.model_validate(article.content)
    except ValidationError as exc:
        raise ConflictError("Содержимое статьи недоступно.") from exc

    block = _find_exercise(content, exercise_id)
    if block is None or block.type not in (
        "single_choice",
        "numeric_input",
        "text_input",
        "matching",
    ):
        raise NotFoundError(f"Упражнение «{exercise_id}» не найдено.")

    if block.type == "single_choice":
        is_correct = answer.strip() == block.data.correct_option_id
        explanation = block.data.explanation if is_correct else None
    elif block.type == "text_input":
        is_correct = _text_matches(
            answer, block.data.correct_answer, block.data.case_sensitive
        )
        explanation = block.data.explanation if is_correct else None
    elif block.type == "matching":
        normalized = "".join(ch for ch in answer.strip() if ch.isdigit())
        is_correct = normalized == block.data.correct_answer.strip()
        explanation = block.data.explanation if is_correct else None
    else:
        is_correct = _numeric_matches(answer, block.data.correct_value, block.data.tolerance)
        explanation = block.data.explanation if is_correct else None

    checked_at = utcnow()
    attempts: int | None = None
    solved: bool | None = None
    if user_id is not None:
        row = await record_article_exercise_attempt(
            session,
            user_id=user_id,
            article_id=article.id,
            exercise_id=exercise_id,
            is_correct=is_correct,
            checked_at=checked_at,
        )
        attempts = row.attempts
        solved = row.solved

    return ArticleExerciseCheckResponse(
        is_correct=is_correct,
        checked_at=checked_at,
        explanation=explanation,
        attempts=attempts,
        solved=solved,
    )
