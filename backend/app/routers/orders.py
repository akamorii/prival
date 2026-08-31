import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload

from .. import models
from ..database import get_db
from ..mailer import MailerNotConfigured, send_order_email
from ..schemas import CreateOrderIn, OrderOut, OrderStatusIn
from ..security import require_admin

logger = logging.getLogger("orders")

router = APIRouter(prefix="/api/orders", tags=["orders"])


def _order_query(db: Session):
    return db.query(models.Order).options(selectinload(models.Order.items))


@router.post("", response_model=OrderOut, status_code=201, response_model_by_alias=True)
def create_order(payload: CreateOrderIn, db: Session = Depends(get_db)):
    if not payload.items:
        raise HTTPException(status_code=400, detail="Корзина пуста")

    if payload.fulfillment_type == models.FulfillmentType.dine_in and not payload.table_number:
        raise HTTPException(status_code=400, detail="Укажите номер стола")

    if payload.fulfillment_type == models.FulfillmentType.delivery and not (payload.address or "").strip():
        raise HTTPException(status_code=400, detail="Укажите адрес доставки")

    total = sum(item.price * item.quantity for item in payload.items)

    order = models.Order(
        table_number=payload.table_number,
        comment=payload.comment,
        total=total,
        status=models.OrderStatus.new,
        fulfillment_type=payload.fulfillment_type,
        payment_method=payload.payment_method,
        address=payload.address,
    )
    db.add(order)
    db.flush()

    for item in payload.items:
        db.add(
            models.OrderItem(
                order_id=order.id,
                dish_id=item.dish_id,
                name=item.name,
                price=item.price,
                quantity=item.quantity,
            )
        )

    db.commit()
    db.refresh(order)
    _ = order.items  # load relationship before session churn

    try:
        send_order_email(db, order)
        order.email_sent = True
        db.commit()
        db.refresh(order)
    except MailerNotConfigured as exc:
        logger.warning("Order %s saved, email not sent: %s", order.id, exc)
    except Exception:
        logger.exception("Order %s saved, but email sending failed", order.id)

    return order


@router.get("", response_model=list[OrderOut], response_model_by_alias=True, dependencies=[Depends(require_admin)])
def list_orders(db: Session = Depends(get_db)):
    return _order_query(db).order_by(models.Order.id.desc()).all()


@router.get("/{order_id}", response_model=OrderOut, response_model_by_alias=True)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = _order_query(db).filter(models.Order.id == order_id).first()
    if order is None:
        raise HTTPException(status_code=404, detail="Заказ не найден")
    return order


@router.patch("/{order_id}/status", response_model=OrderOut, response_model_by_alias=True, dependencies=[Depends(require_admin)])
def update_order_status(order_id: int, payload: OrderStatusIn, db: Session = Depends(get_db)):
    order = _order_query(db).filter(models.Order.id == order_id).first()
    if order is None:
        raise HTTPException(status_code=404, detail="Заказ не найден")
    order.status = payload.status
    db.commit()
    db.refresh(order)
    return order
