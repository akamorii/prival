"""add dish photo_url_2, info_fields table, order fulfillment/payment/address

Revision ID: 24e2c73c7d0d
Revises: f9af017f5530
Create Date: 2026-08-31 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '24e2c73c7d0d'
down_revision: Union[str, None] = 'f9af017f5530'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('dishes', sa.Column('photo_url_2', sa.String(), nullable=True))

    op.create_table(
        'info_fields',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('label', sa.String(), nullable=False),
        sa.Column('value', sa.Text(), nullable=False),
        sa.Column('sort_order', sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )

    op.alter_column('orders', 'table_number', existing_type=sa.Integer(), nullable=True)

    fulfillment_type = sa.Enum('delivery', 'pickup', 'dine_in', name='fulfillment_type')
    fulfillment_type.create(op.get_bind())
    op.add_column(
        'orders',
        sa.Column('fulfillment_type', fulfillment_type, nullable=False, server_default='dine_in'),
    )
    op.alter_column('orders', 'fulfillment_type', server_default=None)

    payment_method = sa.Enum('cash', 'card', name='payment_method')
    payment_method.create(op.get_bind())
    op.add_column(
        'orders',
        sa.Column('payment_method', payment_method, nullable=False, server_default='cash'),
    )
    op.alter_column('orders', 'payment_method', server_default=None)

    op.add_column('orders', sa.Column('address', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('orders', 'address')
    op.drop_column('orders', 'payment_method')
    sa.Enum(name='payment_method').drop(op.get_bind())
    op.drop_column('orders', 'fulfillment_type')
    sa.Enum(name='fulfillment_type').drop(op.get_bind())
    op.alter_column('orders', 'table_number', existing_type=sa.Integer(), nullable=False)
    op.drop_table('info_fields')
    op.drop_column('dishes', 'photo_url_2')
