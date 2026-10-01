from sqlalchemy import func
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models
from ..database import get_db
from ..schemas import AvailabilityIn, DishIn, DishOut
from ..security import require_admin

router = APIRouter(prefix="/api/dishes", tags=["dishes"])


@router.get("", response_model=list[DishOut], response_model_by_alias=True)
def list_dishes(db: Session = Depends(get_db)):
    return db.query(models.Dish).order_by(models.Dish.sort_order).all()


@router.put("/{dish_id}", response_model=DishOut, response_model_by_alias=True, dependencies=[Depends(require_admin)])
def upsert_dish(dish_id: str, payload: DishIn, db: Session = Depends(get_db)):
    category = db.query(models.Category).filter(models.Category.id == payload.category_id).first()
    if category is None:
        raise HTTPException(status_code=400, detail="Категория не найдена")

    dish = db.query(models.Dish).filter(models.Dish.id == dish_id).first()
    if dish is None:
        next_order = db.query(func.coalesce(func.max(models.Dish.sort_order), -1)).scalar() + 1
        dish = models.Dish(id=dish_id, sort_order=next_order)
        db.add(dish)

    dish.category_id = payload.category_id
    dish.name = payload.name
    dish.description = payload.description
    dish.composition = payload.composition
    dish.weight = payload.weight
    dish.price = payload.price
    dish.photo_urls = payload.photo_urls
    dish.available = payload.available

    db.commit()
    db.refresh(dish)
    return dish


@router.patch("/{dish_id}/availability", response_model=DishOut, response_model_by_alias=True, dependencies=[Depends(require_admin)])
def set_dish_availability(dish_id: str, payload: AvailabilityIn, db: Session = Depends(get_db)):
    dish = db.query(models.Dish).filter(models.Dish.id == dish_id).first()
    if dish is None:
        raise HTTPException(status_code=404, detail="Блюдо не найдено")
    dish.available = payload.available
    db.commit()
    db.refresh(dish)
    return dish


@router.delete("/{dish_id}", status_code=204, dependencies=[Depends(require_admin)])
def delete_dish(dish_id: str, db: Session = Depends(get_db)):
    dish = db.query(models.Dish).filter(models.Dish.id == dish_id).first()
    if dish is None:
        raise HTTPException(status_code=404, detail="Блюдо не найдено")
    db.delete(dish)
    db.commit()
