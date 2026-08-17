from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .routers import auth, categories, dishes, orders, reports, settings as settings_router

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
app.include_router(orders.router)
app.include_router(reports.router)
app.include_router(settings_router.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
