

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql


revision: str = "a3b1e58fe050"
down_revision: str | None = "32b21a07d4ef"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

_CONTENT_VERSION_PAIR = (
    "(content IS NULL AND content_version IS NULL) OR "
    "(content IS NOT NULL AND content_version IS NOT NULL AND content_version >= 1)"
)


def upgrade() -> None:
    with op.batch_alter_table("articles", schema=None) as batch_op:
        batch_op.add_column(
            sa.Column(
                "content",
                sa.JSON().with_variant(postgresql.JSONB(astext_type=sa.Text()), "postgresql"),
                nullable=True,
            )
        )
        batch_op.add_column(sa.Column("content_version", sa.Integer(), nullable=True))
        batch_op.create_index(
            batch_op.f("ix_articles_content_version"),
            ["content_version"],
            unique=False,
        )
        batch_op.create_check_constraint(
            batch_op.f("ck_articles_content_version_pair"),
            _CONTENT_VERSION_PAIR,
        )


def downgrade() -> None:
    with op.batch_alter_table("articles", schema=None) as batch_op:
        batch_op.drop_constraint(batch_op.f("ck_articles_content_version_pair"), type_="check")
        batch_op.drop_index(batch_op.f("ix_articles_content_version"))
        batch_op.drop_column("content_version")
        batch_op.drop_column("content")
