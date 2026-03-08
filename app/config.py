from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Settings:
    app_name: str = "왕과 사는 남자: 충성도 테스트"
    app_version: str = "0.1.0"
    database_filename: str = "kings_warden.db"

    @property
    def project_root(self) -> Path:
        return Path(__file__).resolve().parent.parent

    @property
    def app_dir(self) -> Path:
        return self.project_root / "app"

    @property
    def templates_dir(self) -> Path:
        return self.project_root / "templates"

    @property
    def static_dir(self) -> Path:
        return self.project_root / "static"

    @property
    def database_path(self) -> Path:
        return self.project_root / self.database_filename

    @property
    def database_url(self) -> str:
        """배포 시 DATABASE_URL 환경변수로 오버라이드 가능 (예: sqlite:///./data/kings_warden.db)"""
        url = os.environ.get("DATABASE_URL")
        if url:
            return url
        return f"sqlite:///{self.database_path}"


settings = Settings()
