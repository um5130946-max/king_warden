from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class TestSession(Base):
    __tablename__ = "test_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    session_uuid: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    total_score: Mapped[int] = mapped_column(Integer, nullable=False)
    result_type: Mapped[str] = mapped_column(String(50), nullable=False)
    emotion_word: Mapped[str] = mapped_column(String(20), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    answers: Mapped[list["Answer"]] = relationship(
        back_populates="session",
        cascade="all, delete-orphan",
    )
    game_records: Mapped[list["GameRecord"]] = relationship(
        back_populates="session",
        cascade="all, delete-orphan",
    )


class Answer(Base):
    __tablename__ = "answers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("test_sessions.id"), nullable=False, index=True)
    question_id: Mapped[int] = mapped_column(Integer, nullable=False)
    selected_option: Mapped[str] = mapped_column(String(1), nullable=False)
    score: Mapped[int] = mapped_column(Integer, nullable=False)

    session: Mapped[TestSession] = relationship(back_populates="answers")


class GameRecord(Base):
    __tablename__ = "game_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    session_id: Mapped[int | None] = mapped_column(
        ForeignKey("test_sessions.id"),
        nullable=True,
        index=True,
    )
    game_type: Mapped[str] = mapped_column(String(20), nullable=False)
    score: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    session: Mapped[TestSession | None] = relationship(back_populates="game_records")


class GodiRecord(Base):
    """다슬기국 게임 기록 (닉네임, 나이, 완료 시간)"""

    __tablename__ = "godi_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    nickname: Mapped[str] = mapped_column(String(50), nullable=False)
    age: Mapped[int | None] = mapped_column(Integer, nullable=True)
    time_ms: Mapped[int] = mapped_column(Integer, nullable=False)
    difficulty: Mapped[str] = mapped_column(String(20), default="medium", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
