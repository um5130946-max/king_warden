from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class AnswerSubmission(BaseModel):
    question_id: int = Field(ge=1)
    selected_option: Literal["A", "B", "C", "D"]


class TestSubmitRequest(BaseModel):
    answers: list[AnswerSubmission] = Field(min_length=10, max_length=10)
    emotion_word: str = Field(default="여운", min_length=1)


class TestSubmitResponse(BaseModel):
    session_uuid: str
    total_score: int
    result_type: str


class GameRecordRequest(BaseModel):
    session_uuid: str = Field(min_length=1)
    game_type: str = Field(min_length=1)
    score: int


class SuccessResponse(BaseModel):
    success: bool


class GameRecordResponse(BaseModel):
    success: bool
    rank: int
    total_players: int
    top_percentile: float
    best_score: int


class SummaryResponse(BaseModel):
    total_participants: int
    average_score: float
    loyalist_ratio: float
    top_emotion: str


class EmotionCount(BaseModel):
    word: str
    count: int


class EmotionsResponse(BaseModel):
    items: list[EmotionCount]


class ResultDistributionItem(BaseModel):
    result_type: str
    count: int
    ratio: float


class ResultsResponse(BaseModel):
    items: list[ResultDistributionItem]


class GameTopResponse(BaseModel):
    records: dict[str, int]


class TestSessionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    session_uuid: str
    total_score: int
    result_type: str
    emotion_word: str


class GodiRecordRequest(BaseModel):
    nickname: str = Field(min_length=1, max_length=50)
    age: int | None = Field(default=None, ge=1, le=120)
    time_ms: int = Field(ge=0)
    difficulty: str = Field(default="medium", min_length=1, max_length=20)


class GodiRankResponse(BaseModel):
    overall_rank: int
    overall_total: int
    age_group: str | None
    age_rank: int | None
    age_total: int | None


class GodiLeaderboardItem(BaseModel):
    rank: int
    nickname: str
    time_ms: int
    difficulty: str


class GodiLeaderboardResponse(BaseModel):
    items: list[GodiLeaderboardItem]
    total: int
