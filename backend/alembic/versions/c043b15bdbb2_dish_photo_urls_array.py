"""replace dish photo_url/photo_url_2 with unlimited photo_urls array

Revision ID: c043b15bdbb2
Revises: 24e2c73c7d0d
Create Date: 2026-10-01 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'c043b15bdbb2'
down_revision: Union[str, None] = '24e2c73c7d0d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'dishes',
        sa.Column('photo_urls', postgresql.ARRAY(sa.String()), nullable=False, server_default='{}'),
    )
    op.execute(
        "UPDATE dishes SET photo_urls = array_remove(ARRAY[photo_url, photo_url_2], NULL)"
    )
    op.drop_column('dishes', 'photo_url')
    op.drop_column('dishes', 'photo_url_2')


def downgrade() -> None:
    op.add_column('dishes', sa.Column('photo_url', sa.String(), nullable=True))
    op.add_column('dishes', sa.Column('photo_url_2', sa.String(), nullable=True))
    op.execute("UPDATE dishes SET photo_url = photo_urls[1], photo_url_2 = photo_urls[2]")
    op.drop_column('dishes', 'photo_urls')
