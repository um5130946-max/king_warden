from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import GameRecordRequest, GameRecordResponse
from app.services.game import save_game_record

router = APIRouter(prefix="/api/game", tags=["game"])


@router.post("/record", response_model=GameRecordResponse)
def record_game_score(
    payload: GameRecordRequest,
    db: Session = Depends(get_db),
) -> GameRecordResponse:
    summary = save_game_record(
        db,
        session_uuid=payload.session_uuid,
        game_type=payload.game_type,
        score=payload.score,
    )
    return GameRecordResponse(success=True, **summary)
