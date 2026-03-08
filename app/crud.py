from __future__ import annotations

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import Answer, GameRecord, TestSession


def create_test_session(
    db: Session,
    *,
    session_uuid: str,
    total_score: int,
    result_type: str,
    emotion_word: str,
) -> TestSession:
    test_session = TestSession(
        session_uuid=session_uuid,
        total_score=total_score,
        result_type=result_type,
        emotion_word=emotion_word,
    )
    db.add(test_session)
    db.flush()
    return test_session


def create_answers(
    db: Session,
    *,
    session_id: int,
    answers: list[dict[str, int | str]],
) -> list[Answer]:
    answer_rows = [
        Answer(
            session_id=session_id,
            question_id=int(answer["question_id"]),
            selected_option=str(answer["selected_option"]),
            score=int(answer["score"]),
        )
        for answer in answers
    ]
    db.add_all(answer_rows)
    db.flush()
    return answer_rows


def create_test_submission(
    db: Session,
    *,
    session_uuid: str,
    total_score: int,
    result_type: str,
    emotion_word: str,
    answers: list[dict[str, int | str]],
) -> TestSession:
    test_session = create_test_session(
        db,
        session_uuid=session_uuid,
        total_score=total_score,
        result_type=result_type,
        emotion_word=emotion_word,
    )
    create_answers(db, session_id=test_session.id, answers=answers)
    db.commit()
    db.refresh(test_session)
    return test_session


def get_test_session_by_uuid(db: Session, session_uuid: str) -> TestSession | None:
    statement = select(TestSession).where(TestSession.session_uuid == session_uuid)
    return db.scalar(statement)


def create_game_record(
    db: Session,
    *,
    session_id: int | None,
    game_type: str,
    score: int,
) -> GameRecord:
    record = GameRecord(
        session_id=session_id,
        game_type=game_type,
        score=score,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def get_game_rank_summary(
    db: Session,
    *,
    game_type: str,
    score: int,
) -> dict[str, int | float]:
    total_players = int(
        db.scalar(select(func.count(GameRecord.id)).where(GameRecord.game_type == game_type)) or 0
    )
    higher_scores = int(
        db.scalar(
            select(func.count(GameRecord.id)).where(
                GameRecord.game_type == game_type,
                GameRecord.score > score,
            )
        )
        or 0
    )
    best_score = int(
        db.scalar(select(func.max(GameRecord.score)).where(GameRecord.game_type == game_type)) or 0
    )
    rank = higher_scores + 1
    top_percentile = round((rank / total_players) * 100, 2) if total_players else 100.0

    return {
        "rank": rank,
        "total_players": total_players,
        "top_percentile": top_percentile,
        "best_score": best_score,
    }
