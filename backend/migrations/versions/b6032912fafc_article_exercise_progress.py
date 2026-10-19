"""article exercise progress

Revision ID: b6032912fafc
Revises: a3b1e58fe050
Create Date: 2026-10-19 00:00:00.000000

Adds per-user progress for interactive article exercises. The table lives in the
existing ``progress`` domain and is keyed by (user, article, exercise block id).
It is purely additive: existing tables and data are untouched, and no backfill
is required.
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

import app.db.base

# revision identifiers, used by Alembic.
revision: str = "b6032912fafc"
down_revision: str | None = "a3b1e58fe050"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "article_exercise_progress",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", app.db.base.UUIDType(), nullable=False),
        sa.Column("article_id", sa.Integer(), nullable=False),
        sa.Column("exercise_id", sa.String(length=64), nullable=False),
        sa.Column("attempts", sa.Integer(), nullable=False),
        sa.Column("correct_attempts", sa.Integer(), nullable=False),
        sa.Column("solved", sa.Boolean(), nullable=False),
        sa.Column("last_correct", sa.Boolean(), nullable=True),
        sa.Column("last_attempt_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(
            ["article_id"],
            ["articles.id"],
            name=op.f("fk_article_exercise_progress_article_id_articles"),
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name=op.f("fk_article_exercise_progress_user_id_users"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_article_exercise_progress")),
        sa.UniqueConstraint(
            "user_id",
            "article_id",
            "exercise_id",
            name=op.f("uq_article_exercise_progress_user_article_exercise"),
        ),
    )
    op.create_index(
        op.f("ix_article_exercise_progress_user_id"),
        "article_exercise_progress",
        ["user_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_article_exercise_progress_article_id"),
        "article_exercise_progress",
        ["article_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_article_exercise_progress_exercise_id"),
        "article_exercise_progress",
        ["exercise_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        op.f("ix_article_exercise_progress_exercise_id"),
        table_name="article_exercise_progress",
    )
    op.drop_index(
        op.f("ix_article_exercise_progress_article_id"),
        table_name="article_exercise_progress",
    )
    op.drop_index(
        op.f("ix_article_exercise_progress_user_id"),
        table_name="article_exercise_progress",
    )
    op.drop_table("article_exercise_progress")
