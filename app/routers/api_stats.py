from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import EmotionsResponse, GameTopResponse, ResultsResponse, SummaryResponse
from app.services.stats import (
    get_emotion_distribution,
    get_result_distribution,
    get_summary,
    get_top_game_scores,
)

router = APIRouter(prefix="/api/stats", tags=["stats"])


@router.get("/summary", response_model=SummaryResponse)
def get_stats_summary(db: Session = Depends(get_db)) -> SummaryResponse:
    return SummaryResponse(**get_summary(db))


@router.get("/emotions", response_model=EmotionsResponse)
def get_stats_emotions(db: Session = Depends(get_db)) -> EmotionsResponse:
    return EmotionsResponse(items=get_emotion_distribution(db))


@router.get("/results", response_model=ResultsResponse)
def get_stats_results(db: Session = Depends(get_db)) -> ResultsResponse:
    return ResultsResponse(items=get_result_distribution(db))


@router.get("/game-top", response_model=GameTopResponse)
def get_stats_game_top(db: Session = Depends(get_db)) -> GameTopResponse:
    return GameTopResponse(records=get_top_game_scores(db))
