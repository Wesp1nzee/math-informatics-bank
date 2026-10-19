from __future__ import annotations

from fastapi import APIRouter, Depends, Path, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.pagination import Page, PaginationParams, build_page
from app.db.session import get_session
from app.domains.articles.schemas import (
    ArticleCreate,
    ArticleEditorRead,
    ArticleExerciseCheckRequest,
    ArticleExerciseCheckResponse,
    ArticleRead,
    ArticleUpdate,
)
from app.domains.articles.service import (
    check_article_exercise,
    count_published_articles,
    create_draft,
    get_article_by_slug,
    get_article_for_editor,
    list_articles,
    list_published_page,
    publish_article,
    unpublish_article,
    update_draft,
)
from app.domains.users.deps import get_optional_user, require_admin
from app.domains.users.models import User

router = APIRouter(prefix="/articles", tags=["articles"])

# Public routes ---------------------------------------------------------------
# NOTE: ``/page`` is a reserved single-segment path; slugs equal to it are
# rejected by ``ArticleCreate``/``ArticleUpdate``.


@router.get("", response_model=list[ArticleRead], summary="Список статей")
async def articles_list(
    subject: str | None = Query(None, description="Фильтр по slug предмета"),
    session: AsyncSession = Depends(get_session),
) -> list[ArticleRead]:
    return await list_articles(session, subject_slug=subject)


@router.get(
    "/page",
    response_model=Page[ArticleRead],
    summary="Список опубликованных статей (постранично)",
)
async def articles_page(
    subject: str | None = Query(None, description="Фильтр по slug предмета"),
    params: PaginationParams = Depends(),
    session: AsyncSession = Depends(get_session),
) -> Page[ArticleRead]:
    total = await count_published_articles(session, subject_slug=subject)
    items = await list_published_page(
        session, subject_slug=subject, limit=params.limit, offset=params.offset
    )
    return build_page(items, total, params)


# Editor routes (admin only) --------------------------------------------------


@router.post(
    "",
    response_model=ArticleEditorRead,
    status_code=status.HTTP_201_CREATED,
    summary="Создать черновик статьи",
)
async def create_article_draft(
    payload: ArticleCreate,
    session: AsyncSession = Depends(get_session),
    _admin: User = Depends(require_admin),
) -> ArticleEditorRead:
    article = await create_draft(session, payload)
    return ArticleEditorRead.from_article(article)


@router.get(
    "/{article_id}/draft",
    response_model=ArticleEditorRead,
    summary="Получить черновик статьи",
)
async def article_draft(
    article_id: int = Path(..., ge=1),
    session: AsyncSession = Depends(get_session),
    _admin: User = Depends(require_admin),
) -> ArticleEditorRead:
    article = await get_article_for_editor(session, article_id)
    return ArticleEditorRead.from_article(article)


@router.patch(
    "/{article_id}/draft",
    response_model=ArticleEditorRead,
    summary="Обновить черновик статьи",
)
async def update_article_draft(
    payload: ArticleUpdate,
    article_id: int = Path(..., ge=1),
    session: AsyncSession = Depends(get_session),
    _admin: User = Depends(require_admin),
) -> ArticleEditorRead:
    article = await update_draft(session, article_id, payload)
    return ArticleEditorRead.from_article(article)


@router.post(
    "/{article_id}/publish",
    response_model=ArticleEditorRead,
    summary="Опубликовать статью",
)
async def publish_article_endpoint(
    article_id: int = Path(..., ge=1),
    session: AsyncSession = Depends(get_session),
    _admin: User = Depends(require_admin),
) -> ArticleEditorRead:
    article = await publish_article(session, article_id)
    return ArticleEditorRead.from_article(article)


@router.post(
    "/{article_id}/unpublish",
    response_model=ArticleEditorRead,
    summary="Снять статью с публикации",
)
async def unpublish_article_endpoint(
    article_id: int = Path(..., ge=1),
    session: AsyncSession = Depends(get_session),
    _admin: User = Depends(require_admin),
) -> ArticleEditorRead:
    article = await unpublish_article(session, article_id)
    return ArticleEditorRead.from_article(article)


# Public exercise check -------------------------------------------------------
# Anonymous checks are allowed; progress is persisted only for authenticated
# users (optional session cookie).


@router.post(
    "/{slug}/exercises/{exercise_id}/check",
    response_model=ArticleExerciseCheckResponse,
    summary="Проверить ответ упражнения статьи",
)
async def check_article_exercise_endpoint(
    payload: ArticleExerciseCheckRequest,
    slug: str = Path(..., min_length=1),
    exercise_id: str = Path(..., min_length=1, max_length=64),
    session: AsyncSession = Depends(get_session),
    user: User | None = Depends(get_optional_user),
) -> ArticleExerciseCheckResponse:
    article = await get_article_by_slug(session, slug)
    return await check_article_exercise(
        session,
        article=article,
        exercise_id=exercise_id,
        answer=payload.answer,
        user_id=user.id if user is not None else None,
    )


# Public detail ---------------------------------------------------------------


@router.get("/{slug}", response_model=ArticleRead, summary="Статья по slug")
async def article_detail(
    slug: str = Path(..., min_length=1),
    session: AsyncSession = Depends(get_session),
) -> ArticleRead:
    article = await get_article_by_slug(session, slug)
    return ArticleRead.from_article(article)
