from .database import SessionLocal
from . import models
from .seed_data import DEFAULT_NOTIFY_EMAIL, SEED_CATEGORIES, SEED_DISHES


def run_seed() -> None:
    db = SessionLocal()
    try:
        if db.query(models.Category).count() == 0:
            for row in SEED_CATEGORIES:
                db.add(models.Category(**row))
            for index, row in enumerate(SEED_DISHES):
                db.add(models.Dish(**row, available=True, sort_order=index))

        if db.query(models.AppSettings).filter(models.AppSettings.id == 1).first() is None:
            db.add(models.AppSettings(id=1, notify_email=DEFAULT_NOTIFY_EMAIL))

        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()
