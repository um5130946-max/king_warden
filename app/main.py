from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from app.config import settings
from app.database import init_db
from app.routers import api_game, api_godi, api_stats, api_test, pages


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    lifespan=lifespan,
)

app.state.templates = Jinja2Templates(directory=str(settings.templates_dir))
app.mount(
    "/static",
    StaticFiles(directory=str(settings.static_dir), check_dir=False),
    name="static",
)
app.mount(
    "/images",
    StaticFiles(directory=str(settings.project_root / "images"), check_dir=False),
    name="images",
)
app.mount(
    "/standalone",
    StaticFiles(directory=str(settings.project_root / "standalone"), html=True),
    name="standalone",
)
app.include_router(pages.router)
app.include_router(api_test.router)
app.include_router(api_stats.router)
app.include_router(api_game.router)
app.include_router(api_godi.router)
