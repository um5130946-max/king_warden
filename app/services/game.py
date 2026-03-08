from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.constants import GAME_TYPES, MAX_GAME_SCORE
from app.crud import create_game_record, get_game_rank_summary, get_test_session_by_uuid


def validate_game_type(game_type: str) -> str:
    normalized = game_type.strip().lower()
    if normalized not in GAME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Unsupported game_type: {game_type}",
        )
    return normalized


def validate_game_score(score: int) -> int:
    if score < 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="score must be zero or greater",
        )
    if score > MAX_GAME_SCORE:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"score must be {MAX_GAME_SCORE} or less",
        )
    return score


def save_game_record(
    db: Session,
    *,
    session_uuid: str,
    game_type: str,
    score: int,
) -> dict[str, int | float]:
    normalized_game_type = validate_game_type(game_type)
    validated_score = validate_game_score(score)

    session = get_test_session_by_uuid(db, session_uuid)
    if session is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test session not found",
        )

    create_game_record(
        db,
        session_id=session.id,
        game_type=normalized_game_type,
        score=validated_score,
    )
    return get_game_rank_summary(
        db,
        game_type=normalized_game_type,
        score=validated_score,
    )
