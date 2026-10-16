"""Seed the database with a small demo dataset.

Idempotent: creates the rows only when the ``subjects`` table is empty.
Run with::

    uv run python -m scripts.seed
"""

from __future__ import annotations

import asyncio

from sqlalchemy import func, select

from app.db.session import session_scope
from app.domains.articles.models import Article
from app.domains.subjects.models import Subject
from app.domains.tasks.models import Task, TaskLevel
from app.domains.topics.models import Topic


async def seed() -> None:
    async with session_scope() as session:
        existing = await session.scalar(select(func.count()).select_from(Subject))
        if existing:
            print("Database already seeded — skipping.")
            return

        matematika = Subject(slug="matematika", label="Математика", position=0)
        informatika = Subject(slug="informatika", label="Информатика", position=1)
        session.add_all([matematika, informatika])
        await session.flush()

        proizvodnaya = Topic(
            slug="proizvodnaya", label="Производная", subject_id=matematika.id, position=0
        )
        logarifmy = Topic(slug="logarifmy", label="Логарифмы", subject_id=matematika.id, position=1)
        sistemy = Topic(
            slug="sistemy-schisleniya",
            label="Системы счисления",
            subject_id=informatika.id,
            position=0,
        )
        session.add_all([proizvodnaya, logarifmy, sistemy])
        await session.flush()

        tasks = [
            Task(
                title="Производная степенной функции",
                subject_id=matematika.id,
                exam_label="ЕГЭ · Профиль",
                level=TaskLevel.EASY,
                minutes=3,
                summary="Найдите значение производной в точке.",
                statement=[
                    {"type": "paragraph", "text": "Дана функция f(x) = x^2. Найдите f'(3)."}
                ],
                answer={"value": "6", "kind": "number", "explanation": "f'(x) = 2x, f'(3) = 6."},
                steps=[{"note": "Правило степени", "tex": "(x^n)' = n x^{n-1}"}],
                featured=True,
                topics=[proizvodnaya],
            ),
            Task(
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
            ),
            Task(
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
            ),
        ]
        session.add_all(tasks)
        await session.flush()

        session.add_all(
            [
                Article(
                    slug="proizvodnaya-razbor",
                    title="Производная: базовый разбор",
                    description="Что такое производная и как её найти на экзамене.",
                    subject_id=matematika.id,
                    exam="ЕГЭ",
                    reading_minutes=5,
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
                ),
                Article(
                    slug="sistemy-schisleniya-razbor",
                    title="Системы счисления для ЕГЭ",
                    description="Как быстро переводить числа между системами счисления.",
                    subject_id=informatika.id,
                    exam="ЕГЭ",
                    reading_minutes=4,
                    blocks=[
                        {
                            "type": "paragraph",
                            "text": (
                                "В информатике чаще всего нужны двоичная "
                                "и шестнадцатеричная системы."
                            ),
                        },
                    ],
                ),
            ]
        )

    print("Seeded demo content (2 subjects, 3 topics, 3 tasks, 2 articles).")


if __name__ == "__main__":
    asyncio.run(seed())
