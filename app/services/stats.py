from __future__ import annotations

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.constants import EMOTION_WORDS, GAME_TYPES, LOYALIST_RESULT_TYPES, RESULT_TYPE_RULES
from app.models import GameRecord, TestSession


def get_total_participants(db: Session) -> int:
    return int(db.scalar(select(func.count(TestSession.id))) or 0)


def get_average_score(db: Session) -> float:
    average = db.scalar(select(func.avg(TestSession.total_score)))
    if average is None:
        return 0.0
    return round(float(average), 2)


def get_loyalist_ratio(db: Session) -> float:
    total = get_total_participants(db)
    if total == 0:
        return 0.0

    loyalist_count = int(
        db.scalar(
            select(func.count(TestSession.id)).where(
                TestSession.result_type.in_(LOYALIST_RESULT_TYPES)
            )
        )
        or 0
    )
    return round((loyalist_count / total) * 100, 2)


def get_top_emotion(db: Session) -> str:
    rows = db.execute(
        select(TestSession.emotion_word, func.count(TestSession.id).label("count"))
        .group_by(TestSession.emotion_word)
        .order_by(func.count(TestSession.id).desc(), TestSession.emotion_word.asc())
    ).all()

    if not rows:
        return ""
    return str(rows[0][0])


def get_emotion_distribution(db: Session) -> list[dict[str, int | str]]:
    rows = db.execute(
        select(TestSession.emotion_word, func.count(TestSession.id))
        .group_by(TestSession.emotion_word)
    ).all()
    count_map = {str(word): int(count) for word, count in rows}

    return [
        {"word": word, "count": count_map.get(word, 0)}
        for word in EMOTION_WORDS
    ]


def get_result_distribution(db: Session) -> list[dict[str, int | float | str]]:
    total = get_total_participants(db)
    rows = db.execute(
        select(TestSession.result_type, func.count(TestSession.id))
        .group_by(TestSession.result_type)
    ).all()
    count_map = {str(result_type): int(count) for result_type, count in rows}

    items: list[dict[str, int | float | str]] = []
    for rule in RESULT_TYPE_RULES:
        result_type = str(rule["name"])
        count = count_map.get(result_type, 0)
        ratio = round((count / total) * 100, 2) if total else 0.0
        items.append(
            {
                "result_type": result_type,
                "count": count,
                "ratio": ratio,
            }
        )
    return items


def get_result_rarity(db: Session, result_type: str) -> float:
    total = get_total_participants(db)
    if total == 0:
        return 0.0

    count = int(
        db.scalar(
            select(func.count(TestSession.id)).where(TestSession.result_type == result_type)
        )
        or 0
    )
    return round((count / total) * 100, 2)


def get_top_game_scores(db: Session) -> dict[str, int]:
    rows = db.execute(
        select(GameRecord.game_type, func.max(GameRecord.score))
        .group_by(GameRecord.game_type)
    ).all()
    score_map = {str(game_type): int(score) for game_type, score in rows if score is not None}

    return {game_type: score_map.get(game_type, 0) for game_type in sorted(GAME_TYPES)}


def get_summary(db: Session) -> dict[str, int | float | str]:
    return {
        "total_participants": get_total_participants(db),
        "average_score": get_average_score(db),
        "loyalist_ratio": get_loyalist_ratio(db),
        "top_emotion": get_top_emotion(db),
    }
