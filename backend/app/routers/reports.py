from datetime import date, datetime, time, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, selectinload

from .. import models
from ..database import get_db
from ..schemas import ReportOut
from ..security import require_admin

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.get("", response_model=ReportOut, response_model_by_alias=True, dependencies=[Depends(require_admin)])
def get_report(
    date_from: date = Query(alias="from"),
    date_to: date = Query(alias="to"),
    db: Session = Depends(get_db),
):
    start = datetime.combine(date_from, time.min, tzinfo=timezone.utc)
    end = datetime.combine(date_to, time.max, tzinfo=timezone.utc)

    orders = (
        db.query(models.Order)
        .options(selectinload(models.Order.items))
        .filter(models.Order.created_at >= start, models.Order.created_at <= end)
        .order_by(models.Order.id.desc())
        .all()
    )
    total = sum(o.total for o in orders)
    return ReportOut(orders_count=len(orders), total=total, orders=orders)
