from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models
from ..database import get_db
from ..schemas import InfoFieldIn, InfoFieldOut
from ..security import require_admin

router = APIRouter(prefix="/api/info-fields", tags=["info-fields"])


@router.get("", response_model=list[InfoFieldOut], response_model_by_alias=True)
def list_info_fields(db: Session = Depends(get_db)):
    return db.query(models.InfoField).order_by(models.InfoField.sort_order).all()


@router.put("/{field_id}", response_model=InfoFieldOut, response_model_by_alias=True, dependencies=[Depends(require_admin)])
def upsert_info_field(field_id: str, payload: InfoFieldIn, db: Session = Depends(get_db)):
    field = db.query(models.InfoField).filter(models.InfoField.id == field_id).first()
    if field is None:
        field = models.InfoField(id=field_id)
        db.add(field)
    field.label = payload.label
    field.value = payload.value
    field.sort_order = payload.sort_order
    db.commit()
    db.refresh(field)
    return field


@router.delete("/{field_id}", status_code=204, dependencies=[Depends(require_admin)])
def delete_info_field(field_id: str, db: Session = Depends(get_db)):
    field = db.query(models.InfoField).filter(models.InfoField.id == field_id).first()
    if field is None:
        raise HTTPException(status_code=404, detail="Поле не найдено")
    db.delete(field)
    db.commit()
