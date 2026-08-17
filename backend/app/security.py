from datetime import datetime, timedelta, timezone

from cryptography.fernet import Fernet, InvalidToken
from fastapi import Header, HTTPException, status
from jose import JWTError, jwt

from .config import settings

ALGORITHM = "HS256"


def create_access_token() -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expires_minutes)
    payload = {"sub": "admin", "exp": expire}
    return jwt.encode(payload, settings.jwt_secret, algorithm=ALGORITHM)


def verify_access_token(token: str) -> bool:
    try:
        jwt.decode(token, settings.jwt_secret, algorithms=[ALGORITHM])
        return True
    except JWTError:
        return False


def require_admin(authorization: str | None = Header(default=None)) -> None:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Не авторизовано")
    token = authorization.removeprefix("Bearer ").strip()
    if not verify_access_token(token):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Сессия истекла, войдите заново")


def _fernet() -> Fernet:
    return Fernet(settings.encryption_key.encode())


def encrypt_secret(value: str) -> str:
    return _fernet().encrypt(value.encode()).decode()


def decrypt_secret(value: str) -> str | None:
    try:
        return _fernet().decrypt(value.encode()).decode()
    except InvalidToken:
        return None
