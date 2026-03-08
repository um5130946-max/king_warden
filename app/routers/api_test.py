from __future__ import annotations

from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.constants import EMOTION_WORDS, EXPECTED_QUESTION_COUNT, OPTION_SCORES, TEST_QUESTIONS
from app.crud import create_test_submission
from app.database import get_db
from app.schemas import TestSubmitRequest, TestSubmitResponse
from app.services.scoring import calculate_total_score, determine_result_type

router = APIRouter(prefix="/api/test", tags=["test"])

EXPECTED_QUESTION_IDS = {question["id"] for question in TEST_QUESTIONS}


@router.post("/submit", response_model=TestSubmitResponse)
def submit_test(
    payload: TestSubmitRequest,
    db: Session = Depends(get_db),
) -> TestSubmitResponse:
    if len(payload.answers) != EXPECTED_QUESTION_COUNT:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Exactly {EXPECTED_QUESTION_COUNT} answers are required",
        )

    submitted_question_ids = [answer.question_id for answer in payload.answers]
    if set(submitted_question_ids) != EXPECTED_QUESTION_IDS:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Answers must include every question exactly once",
        )

    if len(submitted_question_ids) != len(set(submitted_question_ids)):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Duplicate question_id values are not allowed",
        )

    emotion_word = payload.emotion_word.strip() or "여운"
    if emotion_word not in EMOTION_WORDS:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Unsupported emotion_word",
        )

    total_score = calculate_total_score(payload.answers)
    result_type = determine_result_type(total_score)
    session_uuid = str(uuid4())

    scored_answers = [
        {
            "question_id": answer.question_id,
            "selected_option": answer.selected_option,
            "score": OPTION_SCORES[answer.selected_option],
        }
        for answer in payload.answers
    ]

    session = create_test_submission(
        db,
        session_uuid=session_uuid,
        total_score=total_score,
        result_type=result_type,
        emotion_word=emotion_word,
        answers=scored_answers,
    )

    return TestSubmitResponse(
        session_uuid=session.session_uuid,
        total_score=session.total_score,
        result_type=session.result_type,
    )
