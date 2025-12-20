"""Add author notifications table

Revision ID: add_author_notifications
Revises: add_file_url_to_books
Create Date: 2025-01-15 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add_author_notifications'
down_revision: Union[str, None] = 'add_file_url_books'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create author_notifications table
    op.create_table(
        'author_notifications',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('author_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('notification_type', sa.String(length=50), nullable=True, server_default='new_book'),
        sa.Column('book_id', sa.Integer(), nullable=True),
        sa.Column('cover_url', sa.String(length=500), nullable=True),
        sa.Column('created_by', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True, server_default='true'),
        sa.ForeignKeyConstraint(['author_id'], ['authors.id'], ),
        sa.ForeignKeyConstraint(['book_id'], ['books.id'], ),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_author_notifications_id'), 'author_notifications', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_author_notifications_id'), table_name='author_notifications')
    op.drop_table('author_notifications')

