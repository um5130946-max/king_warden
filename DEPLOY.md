# 왕과 사는 남자 - 배포 가이드

## 로컬 실행

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

브라우저에서 http://127.0.0.1:8000 접속

---

## 배포 방법

### 1. Railway (추천)

1. [Railway](https://railway.app) 가입 후 새 프로젝트 생성
2. GitHub에 코드 푸시 후 Railway에서 **Deploy from GitHub** 선택
3. **Add Variables**에서 `DATABASE_URL` 설정 (선택, 기본값 사용 가능)
4. **Settings** → **Deploy** → **Dockerfile** 사용으로 설정
5. 배포 완료 후 생성된 URL로 접속

> SQLite는 Railway의 **ephemeral storage** 사용. 컨테이너 재시작 시 DB가 초기화될 수 있음. 영구 저장이 필요하면 PostgreSQL 등으로 전환 고려.

---

### 2. Render

1. [Render](https://render.com) 가입
2. **New** → **Web Service**
3. GitHub 저장소 연결
4. 설정:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. **Environment** → `DATABASE_URL` 추가 (선택)
6. Deploy

---

### 3. Docker로 직접 배포 (VPS, EC2 등)

```bash
# 이미지 빌드
docker build -t kings-warden .

# 실행 (DB 영구 저장을 위해 볼륨 마운트)
docker run -d -p 8000:8000 \
  -v $(pwd)/data:/app/data \
  -e DATABASE_URL=sqlite:////app/data/kings_warden.db \
  kings-warden
```

---

### 4. Fly.io

```bash
# Fly CLI 설치 후
fly launch
fly deploy
```

`fly.toml`에서 `internal_port = 8000` 설정 확인.

---

## 환경 변수 (선택)

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `DATABASE_URL` | DB 연결 문자열 | `sqlite:///kings_warden.db` |

---

## 참고

- **SQLite**: 배포 시 기록은 0부터 시작 (새 DB 생성)
- **HTTPS**: Railway, Render, Fly.io는 기본 HTTPS 제공
- **도메인**: 각 플랫폼에서 커스텀 도메인 연결 가능
