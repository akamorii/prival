from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .config import settings
from .routers import auth, categories, dishes, info_fields, orders, reports, settings as settings_router, uploads
from .routers.uploads import UPLOAD_DIR

app = FastAPI(title="Привал API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(dishes.router)
app.include_router(info_fields.router)
app.include_router(orders.router)
app.include_router(reports.router)
app.include_router(settings_router.router)
app.include_router(uploads.router)

app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")


@app.get("/api/health")
def health():
    return {"status": "ok"}
