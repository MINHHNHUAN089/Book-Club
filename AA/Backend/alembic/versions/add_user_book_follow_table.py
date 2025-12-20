"""Add user_book_follow table

Revision ID: add_user_book_follow
Revises: add_author_notifications
Create Date: 2025-01-20 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'add_user_book_follow'
down_revision: Union[str, None] = 'add_author_notifications'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create user_book_follow association table
    op.create_table(
        'user_book_follow',
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('book_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['book_id'], ['books.id'], ),
        sa.PrimaryKeyConstraint('user_id', 'book_id')
    )
    op.create_index(op.f('ix_user_book_follow_user_id'), 'user_book_follow', ['user_id'], unique=False)
    op.create_index(op.f('ix_user_book_follow_book_id'), 'user_book_follow', ['book_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_user_book_follow_book_id'), table_name='user_book_follow')
    op.drop_index(op.f('ix_user_book_follow_user_id'), table_name='user_book_follow')
    op.drop_table('user_book_follow')

