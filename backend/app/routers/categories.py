from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models
from ..database import get_db
from ..schemas import CategoryIn, CategoryOut
from ..security import require_admin

router = APIRouter(prefix="/api/categories", tags=["categories"])


@router.get("", response_model=list[CategoryOut], response_model_by_alias=True)
def list_categories(db: Session = Depends(get_db)):
    return db.query(models.Category).order_by(models.Category.sort_order).all()


@router.put("/{category_id}", response_model=CategoryOut, response_model_by_alias=True, dependencies=[Depends(require_admin)])
def upsert_category(category_id: str, payload: CategoryIn, db: Session = Depends(get_db)):
    category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if category is None:
        category = models.Category(id=category_id)
        db.add(category)
    category.name = payload.name
    category.sort_order = payload.sort_order
    db.commit()
    db.refresh(category)
    return category


@router.delete("/{category_id}", status_code=204, dependencies=[Depends(require_admin)])
def delete_category(category_id: str, db: Session = Depends(get_db)):
    category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if category is None:
        raise HTTPException(status_code=404, detail="Категория не найдена")
    db.delete(category)
    db.commit()
