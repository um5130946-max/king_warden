from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import GodiRecord
from app.schemas import GodiLeaderboardItem, GodiLeaderboardResponse, GodiRankResponse, GodiRecordRequest

router = APIRouter(prefix="/api/godi", tags=["godi"])


def _age_group(age: int | None) -> str | None:
    if age is None:
        return None
    if age < 20:
        return "10대"
    if age < 30:
        return "20대"
    if age < 40:
        return "30대"
    if age < 50:
        return "40대"
    if age < 60:
        return "50대"
    return "60대+"


@router.post("/record")
def save_godi_record(
    body: GodiRecordRequest,
    db: Session = Depends(get_db),
) -> dict:
    record = GodiRecord(
        nickname=body.nickname,
        age=body.age,
        time_ms=body.time_ms,
        difficulty=body.difficulty,
    )
    db.add(record)
    db.commit()
    return {"success": True, "id": record.id}


@router.get("/rank", response_model=GodiRankResponse)
def get_godi_rank(
    time_ms: int,
    age: int | None = None,
    difficulty: str = "medium",
    db: Session = Depends(get_db),
) -> GodiRankResponse:
    base = select(GodiRecord).where(GodiRecord.difficulty == difficulty)
    all_records = list(
        db.execute(base.order_by(GodiRecord.time_ms.asc())).scalars().all()
    )

    better_count = sum(1 for r in all_records if r.time_ms < time_ms)
    overall_rank = better_count + 1
    overall_total = len(all_records)

    age_group = _age_group(age) if age else None
    age_rank = None
    age_total = None

    if age_group:
        age_records = [r for r in all_records if _age_group(r.age) == age_group]
        age_total = len(age_records)
        age_better = sum(1 for r in age_records if r.time_ms < time_ms)
        age_rank = age_better + 1

    return GodiRankResponse(
        overall_rank=overall_rank,
        overall_total=overall_total,
        age_group=age_group,
        age_rank=age_rank,
        age_total=age_total,
    )


@router.get("/leaderboard", response_model=GodiLeaderboardResponse)
def get_godi_leaderboard(
    difficulty: str = "medium",
    limit: int = 100,
    db: Session = Depends(get_db),
) -> GodiLeaderboardResponse:
    records = list(
        db.execute(
            select(GodiRecord)
            .where(GodiRecord.difficulty == difficulty)
            .order_by(GodiRecord.time_ms.asc())
            .limit(limit)
        )
        .scalars()
        .all()
    )
    items = [
        GodiLeaderboardItem(
            rank=i + 1,
            nickname=r.nickname,
            time_ms=r.time_ms,
            difficulty=r.difficulty,
        )
        for i, r in enumerate(records)
    ]
    total_count = int(
        db.scalar(
            select(func.count()).select_from(GodiRecord).where(GodiRecord.difficulty == difficulty)
        )
        or 0
    )
    return GodiLeaderboardResponse(items=items, total=total_count)
