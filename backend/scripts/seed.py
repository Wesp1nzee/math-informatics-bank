from __future__ import annotations

import argparse
import asyncio
from datetime import date

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import session_scope
from app.domains.articles.models import Article
from app.domains.articles.schemas import ArticleContent
from app.domains.progress.models import ArticleExerciseProgress, UserProgress
from app.domains.solutions.models import SolutionAttempt
from app.domains.subjects.models import Subject
from app.domains.tasks.models import Task, TaskLevel, task_topics
from app.domains.topics.models import Topic
from scripts.seed_content import ARTICLES, TASKS


async def _get_or_create_subject(
    session: AsyncSession, slug: str, label: str, position: int
) -> Subject:
    subject = await session.scalar(select(Subject).where(Subject.slug == slug))
    if subject is None:
        subject = Subject(slug=slug, label=label, position=position)
        session.add(subject)
        await session.flush()
    return subject


async def _get_or_create_topic(
    session: AsyncSession, slug: str, label: str, subject_id: int, position: int
) -> Topic:
    topic = await session.scalar(select(Topic).where(Topic.slug == slug))
    if topic is None:
        topic = Topic(slug=slug, label=label, subject_id=subject_id, position=position)
        session.add(topic)
        await session.flush()
    return topic


async def _upsert_task(session: AsyncSession, source_ref: str, **fields: object) -> Task:
    task = await session.scalar(select(Task).where(Task.source_ref == source_ref))
    if task is None:
        task = Task(source_ref=source_ref, **fields)
        session.add(task)
    else:
        for key, value in fields.items():
            setattr(task, key, value)
    await session.flush()
    return task


async def _upsert_article(session: AsyncSession, slug: str, **fields: object) -> Article:
    article = await session.scalar(select(Article).where(Article.slug == slug))
    if article is None:
        article = Article(slug=slug, **fields)
        session.add(article)
    else:
        content_changed = any(
            key in fields and fields[key] != getattr(article, key)
            for key in ("title", "description", "content", "exam", "subject_id")
        )
        for key, value in fields.items():
            if key in ("published_on", "updated_on"):
                # Seeding is idempotent: do not move publication dates on every run.
                if getattr(article, key) is None:
                    setattr(article, key, value)
                continue
            setattr(article, key, value)
        if content_changed:
            article.updated_on = date.today()
    await session.flush()
    return article


async def _reset_content(session: AsyncSession) -> None:
    pass
    await session.execute(delete(ArticleExerciseProgress))
    await session.execute(delete(UserProgress))
    await session.execute(delete(SolutionAttempt))
    await session.execute(delete(task_topics))
    await session.execute(delete(Task))
    await session.execute(delete(Article))


async def seed(*, reset: bool = False) -> None:
    async with session_scope() as session:
        if reset:
            await _reset_content(session)

        matematika = await _get_or_create_subject(session, "matematika", "Математика", 0)
        informatika = await _get_or_create_subject(session, "informatika", "Информатика", 1)

        proizvodnaya = await _get_or_create_topic(
            session, "proizvodnaya", "Производная", matematika.id, 0
        )
        logarifmy = await _get_or_create_topic(session, "logarifmy", "Логарифмы", matematika.id, 1)
        sistemy = await _get_or_create_topic(
            session, "sistemy-schisleniya", "Системы счисления", informatika.id, 0
        )

        subjects = {"matematika": matematika, "informatika": informatika}
        topics = {
            "proizvodnaya": proizvodnaya,
            "logarifmy": logarifmy,
            "sistemy-schisleniya": sistemy,
        }

        published = date.today()

        for article in ARTICLES:
            ArticleContent.model_validate(article["content"])
            await _upsert_article(
                session,
                article["slug"],
                title=article["title"],
                description=article["description"],
                subject_id=subjects[article["subject"]].id,
                exam=article["exam"],
                reading_minutes=article["reading_minutes"],
                published_on=published,
                updated_on=published,
                blocks=[],
                content=article["content"],
                content_version=article["content"]["version"],
                is_published=True,
            )

        for task in TASKS:
            await _upsert_task(
                session,
                task["source_ref"],
                title=task["title"],
                subject_id=subjects[task["subject"]].id,
                exam_label=task["exam_label"],
                level=TaskLevel(task["level"]),
                minutes=task["minutes"],
                summary=task["summary"],
                statement=task["statement"],
                answer=task["answer"],
                steps=task["steps"],
                featured=task["featured"],
                is_published=True,
                topics=[topics[task["topic"]]],
            )

    print(
        "Seeded content: "
        f"{len(ARTICLES)} interactive articles, {len(TASKS)} tasks."
        + (" Existing tasks and articles were deleted first." if reset else "")
    )


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Seed demo/editorial content.")
    parser.add_argument(
        "--reset",
        action="store_true",
        help="Delete all tasks and articles (and their progress rows) before seeding.",
    )
    return parser.parse_args()


if __name__ == "__main__":
    asyncio.run(seed(reset=_parse_args().reset))
