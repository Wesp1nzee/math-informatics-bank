"""Seed the database with demo content (idempotent).

Upserts by natural key (subject/topic/article slug, task source_ref), so the
script can be re-run safely to add or update content without duplicating rows.

Run with::

    uv run python -m scripts.seed
"""

from __future__ import annotations

import asyncio
from datetime import date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import session_scope
from app.domains.articles.models import Article
from app.domains.subjects.models import Subject
from app.domains.tasks.models import Task, TaskLevel
from app.domains.topics.models import Topic


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
        for key, value in fields.items():
            setattr(article, key, value)
    await session.flush()
    return article


async def seed() -> None:
    async with session_scope() as session:
        matematika = await _get_or_create_subject(session, "matematika", "Математика", 0)
        informatika = await _get_or_create_subject(session, "informatika", "Информатика", 1)

        proizvodnaya = await _get_or_create_topic(
            session, "proizvodnaya", "Производная", matematika.id, 0
        )
        logarifmy = await _get_or_create_topic(session, "logarifmy", "Логарифмы", matematika.id, 1)
        sistemy = await _get_or_create_topic(
            session, "sistemy-schisleniya", "Системы счисления", informatika.id, 0
        )

        published = date.today()

        await _upsert_task(
            session,
            "seed:proizvodnaya",
            title="Производная степенной функции",
            subject_id=matematika.id,
            exam_label="ЕГЭ · Профиль",
            level=TaskLevel.EASY,
            minutes=3,
            summary="Найдите значение производной в точке.",
            statement=[{"type": "paragraph", "text": "Дана функция f(x) = x^2. Найдите f'(3)."}],
            answer={"value": "6", "kind": "number", "explanation": "f'(x) = 2x, f'(3) = 6."},
            steps=[{"note": "Правило степени", "tex": "(x^n)' = n x^{n-1}"}],
            featured=True,
            topics=[proizvodnaya],
        )

        await _upsert_task(
            session,
            "seed:logarifmy",
            title="Логарифмическое уравнение",
            subject_id=matematika.id,
            exam_label="ЕГЭ · Профиль",
            level=TaskLevel.MEDIUM,
            minutes=5,
            summary="Решите простейшее логарифмическое уравнение.",
            statement=[{"type": "paragraph", "text": "Решите уравнение log2(x) = 3."}],
            answer={"value": "8", "kind": "number", "explanation": "x = 2^3 = 8."},
            steps=[
                {
                    "note": "Определение логарифма",
                    "tex": "\\log_2 x = 3 \\Rightarrow x = 2^3",
                }
            ],
            featured=True,
            topics=[logarifmy],
        )

        await _upsert_task(
            session,
            "seed:sistemy",
            title="Перевод в двоичную систему",
            subject_id=informatika.id,
            exam_label="ЕГЭ · Информатика",
            level=TaskLevel.EASY,
            minutes=3,
            summary="Переведите число из десятичной системы в двоичную.",
            statement=[
                {"type": "paragraph", "text": "Запишите число 13 в двоичной системе счисления."}
            ],
            answer={"value": "1101", "kind": "text", "explanation": "13 = 8 + 4 + 1."},
            steps=[{"note": "Деление на 2", "tex": "13_{10} = 1101_2"}],
            featured=True,
            topics=[sistemy],
        )

        await _upsert_article(
            session,
            "proizvodnaya-razbor",
            title="Производная: базовый разбор",
            description="Что такое производная и как её найти на экзамене.",
            subject_id=matematika.id,
            exam="ЕГЭ",
            reading_minutes=5,
            published_on=published,
            blocks=[
                {
                    "type": "paragraph",
                    "text": "Производная описывает скорость изменения функции.",
                },
                {"type": "heading", "text": "Правила дифференцирования", "id": "rules"},
                {
                    "type": "list",
                    "ordered": False,
                    "items": ["(x^n)' = n x^{n-1}", "(sin x)' = cos x"],
                },
            ],
        )

        await _upsert_article(
            session,
            "sistemy-schisleniya-razbor",
            title="Системы счисления для ЕГЭ",
            description="Как быстро переводить числа между системами счисления.",
            subject_id=informatika.id,
            exam="ЕГЭ",
            reading_minutes=4,
            published_on=published,
            blocks=[
                {
                    "type": "paragraph",
                    "text": (
                        "В информатике чаще всего нужны двоичная и шестнадцатеричная системы."
                    ),
                },
            ],
        )

    print("Seeded demo content (idempotent: 2 subjects, 3 topics, 3 tasks, 2 articles).")


if __name__ == "__main__":
    asyncio.run(seed())
