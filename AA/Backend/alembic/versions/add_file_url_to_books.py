"""Add file_url to books

Revision ID: add_file_url_books
Revises: 8806b2634de1
Create Date: 2025-12-19 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add_file_url_books'
down_revision: Union[str, None] = '8806b2634de1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add file_url column to books table
    op.add_column('books', sa.Column('file_url', sa.String(length=500), nullable=True))


def downgrade() -> None:
    # Remove file_url column from books table
    op.drop_column('books', 'file_url')
