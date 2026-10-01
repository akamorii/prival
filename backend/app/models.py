import enum

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    Sequence,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .database import Base


class OrderStatus(str, enum.Enum):
    new = "new"
    accepted = "accepted"
    ready = "ready"
    closed = "closed"


class FulfillmentType(str, enum.Enum):
    delivery = "delivery"
    pickup = "pickup"
    dine_in = "dine_in"


class PaymentMethod(str, enum.Enum):
    cash = "cash"
    card = "card"


class Category(Base):
    __tablename__ = "categories"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    sort_order = Column(Integer, nullable=False, default=0)

    dishes = relationship("Dish", back_populates="category", cascade="all, delete-orphan")


class Dish(Base):
    __tablename__ = "dishes"

    id = Column(String, primary_key=True)
    category_id = Column(String, ForeignKey("categories.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=False, default="")
    composition = Column(Text, nullable=False, default="")
    weight = Column(String, nullable=False, default="")
    price = Column(Integer, nullable=False, default=0)
    photo_urls = Column(ARRAY(String), nullable=False, default=list, server_default="{}")
    available = Column(Boolean, nullable=False, default=True)
    sort_order = Column(Integer, nullable=False, default=0)

    category = relationship("Category", back_populates="dishes")


class InfoField(Base):
    __tablename__ = "info_fields"

    id = Column(String, primary_key=True)
    label = Column(String, nullable=False)
    value = Column(Text, nullable=False, default="")
    sort_order = Column(Integer, nullable=False, default=0)


order_id_seq = Sequence("order_id_seq", start=1000)


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, order_id_seq, primary_key=True, server_default=order_id_seq.next_value())
    table_number = Column(Integer, nullable=True)
    comment = Column(Text, nullable=False, default="")
    total = Column(Integer, nullable=False)
    status = Column(Enum(OrderStatus, name="order_status"), nullable=False, default=OrderStatus.new)
    fulfillment_type = Column(
        Enum(FulfillmentType, name="fulfillment_type"), nullable=False, default=FulfillmentType.dine_in
    )
    payment_method = Column(Enum(PaymentMethod, name="payment_method"), nullable=False, default=PaymentMethod.cash)
    address = Column(String, nullable=True)
    email_sent = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    dish_id = Column(String, nullable=True)
    name = Column(String, nullable=False)
    price = Column(Integer, nullable=False)
    quantity = Column(Integer, nullable=False)

    order = relationship("Order", back_populates="items")


class AppSettings(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True)
    smtp_email = Column(String, nullable=True)
    smtp_app_password_encrypted = Column(String, nullable=True)
    notify_email = Column(String, nullable=True)
