import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from ..security import require_admin

router = APIRouter(prefix="/api/uploads", tags=["uploads"], dependencies=[Depends(require_admin)])

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
}

MAX_SIZE = 5 * 1024 * 1024


@router.post("")
async def upload_image(file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Разрешены только изображения: JPEG, PNG, WEBP, GIF")

    contents = await file.read()
    if len(contents) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="Файл слишком большой, максимум 5 МБ")
    if not contents:
        raise HTTPException(status_code=400, detail="Пустой файл")

    filename = f"{uuid.uuid4().hex}{ALLOWED_TYPES[file.content_type]}"
    (UPLOAD_DIR / filename).write_bytes(contents)

    return {"url": f"/uploads/{filename}"}
