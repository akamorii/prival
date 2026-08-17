from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models
from ..database import get_db
from ..schemas import SettingsIn, SettingsOut
from ..security import encrypt_secret, require_admin

router = APIRouter(prefix="/api/settings", tags=["settings"], dependencies=[Depends(require_admin)])


def _get_or_create(db: Session) -> models.AppSettings:
    row = db.query(models.AppSettings).filter(models.AppSettings.id == 1).first()
    if row is None:
        row = models.AppSettings(id=1)
        db.add(row)
        db.commit()
        db.refresh(row)
    return row


@router.get("", response_model=SettingsOut, response_model_by_alias=True)
def get_settings(db: Session = Depends(get_db)):
    row = _get_or_create(db)
    return SettingsOut(
        smtp_email=row.smtp_email,
        notify_email=row.notify_email,
        password_set=bool(row.smtp_app_password_encrypted),
    )


@router.put("", response_model=SettingsOut, response_model_by_alias=True)
def update_settings(payload: SettingsIn, db: Session = Depends(get_db)):
    row = _get_or_create(db)
    row.smtp_email = payload.smtp_email
    row.notify_email = payload.notify_email
    if payload.smtp_app_password:
        row.smtp_app_password_encrypted = encrypt_secret(payload.smtp_app_password)
    db.commit()
    db.refresh(row)
    return SettingsOut(
        smtp_email=row.smtp_email,
        notify_email=row.notify_email,
        password_set=bool(row.smtp_app_password_encrypted),
    )
