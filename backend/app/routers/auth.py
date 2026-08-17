from fastapi import APIRouter, HTTPException, status

from ..config import settings
from ..schemas import LoginIn, LoginOut
from ..security import create_access_token

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=LoginOut, response_model_by_alias=True)
def login(payload: LoginIn) -> LoginOut:
    if payload.passcode != settings.admin_passcode:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Неверный код доступа")
    return LoginOut(token=create_access_token())
