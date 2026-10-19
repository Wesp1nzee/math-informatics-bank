
from __future__ import annotations

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

import app.db.base


revision: str = '32b21a07d4ef'
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:

    op.create_table('subjects',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('slug', sa.String(length=64), nullable=False),
    sa.Column('label', sa.String(length=128), nullable=False),
    sa.Column('position', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_subjects'))
    )
    op.create_index(op.f('ix_subjects_slug'), 'subjects', ['slug'], unique=True)
    op.create_table('tutor_leads',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=128), nullable=True),
    sa.Column('contact', sa.String(length=256), nullable=False),
    sa.Column('exam', sa.Enum('oge', 'ege', 'other', name='lead_exam'), nullable=False),
    sa.Column('subject', sa.Enum('matematika', 'informatika', 'both', name='lead_subject'), nullable=True),
    sa.Column('message', sa.Text(), nullable=True),
    sa.Column('consent', sa.Boolean(), nullable=False),
    sa.Column('status', sa.Enum('new', 'contacted', 'closed', name='lead_status'), nullable=False),
    sa.Column('source', sa.String(length=64), nullable=False),
    sa.Column('ip_hash', sa.String(length=64), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_tutor_leads'))
    )
    op.create_index(op.f('ix_tutor_leads_contact'), 'tutor_leads', ['contact'], unique=False)
    op.create_table('users',
    sa.Column('id', app.db.base.UUIDType(), nullable=False),
    sa.Column('email', sa.String(length=256), nullable=False),
    sa.Column('hashed_password', sa.String(length=256), nullable=False),
    sa.Column('display_name', sa.String(length=128), nullable=True),
    sa.Column('role', sa.Enum('student', 'teacher', 'admin', name='user_role'), nullable=False),
    sa.Column('is_active', sa.Boolean(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_users'))
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_table('articles',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('slug', sa.String(length=160), nullable=False),
    sa.Column('title', sa.String(length=256), nullable=False),
    sa.Column('description', sa.String(length=1024), nullable=False),
    sa.Column('subject_id', sa.Integer(), nullable=True),
    sa.Column('exam', sa.String(length=64), nullable=False),
    sa.Column('reading_minutes', sa.Integer(), nullable=False),
    sa.Column('published_on', sa.Date(), nullable=True),
    sa.Column('updated_on', sa.Date(), nullable=True),
    sa.Column('blocks', sa.JSON().with_variant(postgresql.JSONB(astext_type=sa.Text()), 'postgresql'), nullable=False),
    sa.Column('is_published', sa.Boolean(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['subject_id'], ['subjects.id'], name=op.f('fk_articles_subject_id_subjects'), ondelete='SET NULL'),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_articles'))
    )
    op.create_index(op.f('ix_articles_slug'), 'articles', ['slug'], unique=True)
    op.create_table('tasks',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('title', sa.String(length=256), nullable=False),
    sa.Column('subject_id', sa.Integer(), nullable=False),
    sa.Column('exam_label', sa.String(length=64), nullable=False),
    sa.Column('level', sa.Enum('easy', 'medium', 'hard', name='task_level'), nullable=False),
    sa.Column('minutes', sa.Integer(), nullable=False),
    sa.Column('summary', sa.String(length=512), nullable=False),
    sa.Column('statement', sa.JSON().with_variant(postgresql.JSONB(astext_type=sa.Text()), 'postgresql'), nullable=False),
    sa.Column('answer', sa.JSON().with_variant(postgresql.JSONB(astext_type=sa.Text()), 'postgresql'), nullable=False),
    sa.Column('steps', sa.JSON().with_variant(postgresql.JSONB(astext_type=sa.Text()), 'postgresql'), nullable=False),
    sa.Column('featured', sa.Boolean(), nullable=False),
    sa.Column('is_published', sa.Boolean(), nullable=False),
    sa.Column('source_ref', sa.String(length=128), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['subject_id'], ['subjects.id'], name=op.f('fk_tasks_subject_id_subjects'), ondelete='RESTRICT'),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_tasks'))
    )
    op.create_table('topics',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('slug', sa.String(length=96), nullable=False),
    sa.Column('label', sa.String(length=128), nullable=False),
    sa.Column('subject_id', sa.Integer(), nullable=False),
    sa.Column('position', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['subject_id'], ['subjects.id'], name=op.f('fk_topics_subject_id_subjects'), ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_topics'))
    )
    op.create_index(op.f('ix_topics_slug'), 'topics', ['slug'], unique=True)
    op.create_table('user_sessions',
    sa.Column('id', app.db.base.UUIDType(), nullable=False),
    sa.Column('token_hash', sa.String(length=64), nullable=False),
    sa.Column('user_id', app.db.base.UUIDType(), nullable=False),
    sa.Column('expires_at', sa.DateTime(), nullable=False),
    sa.Column('last_used_at', sa.DateTime(), nullable=True),
    sa.Column('user_agent', sa.String(length=256), nullable=True),
    sa.Column('ip_hash', sa.String(length=64), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], name=op.f('fk_user_sessions_user_id_users'), ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_user_sessions'))
    )
    op.create_index(op.f('ix_user_sessions_token_hash'), 'user_sessions', ['token_hash'], unique=True)
    op.create_index(op.f('ix_user_sessions_user_id'), 'user_sessions', ['user_id'], unique=False)
    op.create_table('solution_attempts',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('task_id', sa.Integer(), nullable=False),
    sa.Column('user_id', app.db.base.UUIDType(), nullable=True),
    sa.Column('answer_value', sa.String(length=512), nullable=False),
    sa.Column('outcome', sa.Enum('correct', 'incorrect', name='attempt_outcome'), nullable=False),
    sa.Column('checked_at', sa.DateTime(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['task_id'], ['tasks.id'], name=op.f('fk_solution_attempts_task_id_tasks'), ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], name=op.f('fk_solution_attempts_user_id_users'), ondelete='SET NULL'),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_solution_attempts'))
    )
    op.create_index(op.f('ix_solution_attempts_task_id'), 'solution_attempts', ['task_id'], unique=False)
    op.create_index(op.f('ix_solution_attempts_user_id'), 'solution_attempts', ['user_id'], unique=False)
    op.create_table('task_topics',
    sa.Column('task_id', sa.Integer(), nullable=False),
    sa.Column('topic_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['task_id'], ['tasks.id'], name=op.f('fk_task_topics_task_id_tasks'), ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['topic_id'], ['topics.id'], name=op.f('fk_task_topics_topic_id_topics'), ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('task_id', 'topic_id', name=op.f('pk_task_topics'))
    )
    op.create_table('user_progress',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', app.db.base.UUIDType(), nullable=False),
    sa.Column('task_id', sa.Integer(), nullable=False),
    sa.Column('attempts', sa.Integer(), nullable=False),
    sa.Column('correct_attempts', sa.Integer(), nullable=False),
    sa.Column('solved', sa.Boolean(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['task_id'], ['tasks.id'], name=op.f('fk_user_progress_task_id_tasks'), ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], name=op.f('fk_user_progress_user_id_users'), ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_user_progress')),
    sa.UniqueConstraint('user_id', 'task_id', name='uq_user_progress_user_task')
    )
    op.create_index(op.f('ix_user_progress_task_id'), 'user_progress', ['task_id'], unique=False)
    op.create_index(op.f('ix_user_progress_user_id'), 'user_progress', ['user_id'], unique=False)



def downgrade() -> None:

    op.drop_index(op.f('ix_user_progress_user_id'), table_name='user_progress')
    op.drop_index(op.f('ix_user_progress_task_id'), table_name='user_progress')
    op.drop_table('user_progress')
    op.drop_table('task_topics')
    op.drop_index(op.f('ix_solution_attempts_user_id'), table_name='solution_attempts')
    op.drop_index(op.f('ix_solution_attempts_task_id'), table_name='solution_attempts')
    op.drop_table('solution_attempts')
    op.drop_index(op.f('ix_user_sessions_user_id'), table_name='user_sessions')
    op.drop_index(op.f('ix_user_sessions_token_hash'), table_name='user_sessions')
    op.drop_table('user_sessions')
    op.drop_index(op.f('ix_topics_slug'), table_name='topics')
    op.drop_table('topics')
    op.drop_table('tasks')
    op.drop_index(op.f('ix_articles_slug'), table_name='articles')
    op.drop_table('articles')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
    op.drop_index(op.f('ix_tutor_leads_contact'), table_name='tutor_leads')
    op.drop_table('tutor_leads')
    op.drop_index(op.f('ix_subjects_slug'), table_name='subjects')
    op.drop_table('subjects')

