from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter, Depends, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session

from app.config import settings
from app.crud import get_test_session_by_uuid
from app.database import get_db

router = APIRouter(tags=["pages"])
templates = Jinja2Templates(directory=str(settings.templates_dir))


def _template_exists(template_name: str) -> bool:
    return (Path(settings.templates_dir) / template_name).exists()


def _render_or_fallback(
    request: Request,
    template_name: str,
    context: dict[str, object],
    fallback_title: str,
) -> HTMLResponse:
    if _template_exists(template_name):
        return templates.TemplateResponse(
            request=request,
            name=template_name,
            context=context,
        )

    html = f"""
    <!doctype html>
    <html lang="ko">
      <head>
        <meta charset="utf-8">
        <title>{fallback_title}</title>
      </head>
      <body>
        <h1>{fallback_title}</h1>
        <p>백엔드가 준비되었습니다. 템플릿 파일은 다음 단계에서 연결됩니다.</p>
      </body>
    </html>
    """
    return HTMLResponse(content=html)


@router.get("/", response_class=HTMLResponse)
def index(request: Request) -> HTMLResponse:
    return _render_or_fallback(
        request,
        "index.html",
        {"request": request},
        "왕과 사는 남자: 충성도 테스트",
    )


@router.get("/test", response_class=HTMLResponse)
def test_page(request: Request) -> HTMLResponse:
    return _render_or_fallback(
        request,
        "test.html",
        {"request": request},
        "충성도 테스트",
    )


@router.get("/result/{session_uuid}", response_class=HTMLResponse)
def result_page(
    session_uuid: str,
    request: Request,
    db: Session = Depends(get_db),
) -> HTMLResponse:
    session = get_test_session_by_uuid(db, session_uuid)
    if session is None:
        return RedirectResponse(url="/", status_code=302)

    return _render_or_fallback(
        request,
        "result.html",
        {"request": request, "session": session},
        "테스트 결과",
    )


@router.get("/game/loyal/{session_uuid}", response_class=HTMLResponse)
def loyal_game_page(
    session_uuid: str,
    request: Request,
    db: Session = Depends(get_db),
) -> HTMLResponse:
    session = get_test_session_by_uuid(db, session_uuid)
    if session is None:
        return RedirectResponse(url="/", status_code=302)

    return _render_or_fallback(
        request,
        "game_loyal.html",
        {"request": request, "session": session},
        "단종마마 웃기기 & 허접 호랑이 피하기 대작전",
    )


@router.get("/godi/rank", response_class=HTMLResponse)
def godi_rank_page(request: Request) -> HTMLResponse:
    return _render_or_fallback(
        request,
        "godi_rank.html",
        {"request": request},
        "다슬기국 랭킹",
    )


@router.get("/game/godi/{session_uuid}", response_class=HTMLResponse)
def godi_game_page(
    session_uuid: str,
    request: Request,
    db: Session = Depends(get_db),
) -> HTMLResponse:
    session = get_test_session_by_uuid(db, session_uuid)
    if session is None:
        return RedirectResponse(url="/", status_code=302)

    return _render_or_fallback(
        request,
        "game_godi.html",
        {"request": request, "session": session},
        "다슬기국 빨리 먹기",
    )
