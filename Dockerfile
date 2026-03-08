FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ ./app/
COPY templates/ ./templates/
COPY static/ ./static/
COPY images/ ./images/
COPY standalone/ ./standalone/

# SQLite DB용 디렉터리 (볼륨 마운트 시 사용)
ENV DATABASE_URL=sqlite:////app/data/kings_warden.db
RUN mkdir -p /app/data

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
