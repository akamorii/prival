from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from .models import OrderStatus


class CamelModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True, from_attributes=True)


# ---- categories ----


class CategoryIn(CamelModel):
    name: str
    sort_order: int = Field(default=0, alias="sortOrder")


class CategoryOut(CamelModel):
    id: str
    name: str
    sort_order: int = Field(alias="sortOrder")


# ---- dishes ----


class DishIn(CamelModel):
    category_id: str = Field(alias="categoryId")
    name: str
    description: str = ""
    composition: str = ""
    weight: str = ""
    price: int = 0
    photo_url: str | None = Field(default=None, alias="photoUrl")
    available: bool = True


class DishOut(CamelModel):
    id: str
    category_id: str = Field(alias="categoryId")
    name: str
    description: str
    composition: str
    weight: str
    price: int
    photo_url: str | None = Field(default=None, alias="photoUrl")
    available: bool


class AvailabilityIn(CamelModel):
    available: bool


# ---- orders ----


class OrderItemIn(CamelModel):
    dish_id: str = Field(alias="dishId")
    name: str
    price: int
    quantity: int


class OrderItemOut(CamelModel):
    dish_id: str | None = Field(default=None, alias="dishId")
    name: str
    price: int
    quantity: int


class CreateOrderIn(CamelModel):
    table_number: int = Field(alias="tableNumber")
    items: list[OrderItemIn]
    comment: str = ""


class OrderOut(CamelModel):
    id: int
    table_number: int = Field(alias="tableNumber")
    items: list[OrderItemOut]
    total: int
    comment: str
    status: OrderStatus
    created_at: datetime = Field(alias="createdAt")


class OrderStatusIn(CamelModel):
    status: OrderStatus


# ---- reports ----


class ReportOut(CamelModel):
    orders_count: int = Field(alias="ordersCount")
    total: int
    orders: list[OrderOut]


# ---- settings ----


class SettingsOut(CamelModel):
    smtp_email: str | None = Field(default=None, alias="smtpEmail")
    notify_email: str | None = Field(default=None, alias="notifyEmail")
    password_set: bool = Field(alias="passwordSet")


class SettingsIn(CamelModel):
    smtp_email: EmailStr | None = Field(default=None, alias="smtpEmail")
    smtp_app_password: str | None = Field(default=None, alias="smtpAppPassword")
    notify_email: EmailStr | None = Field(default=None, alias="notifyEmail")


# ---- auth ----


class LoginIn(CamelModel):
    passcode: str


class LoginOut(CamelModel):
    token: str
