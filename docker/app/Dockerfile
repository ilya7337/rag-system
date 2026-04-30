FROM python:3.10-slim-bullseye

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV POETRY_VERSION=1.8.2

RUN apt-get update && apt-get -y install --no-install-recommends gcc libpq-dev \
    && pip install --no-cache-dir "poetry==$POETRY_VERSION" \
    && poetry config virtualenvs.create false

WORKDIR /src

COPY pyproject.toml poetry.lock* ./

RUN poetry install --only main --no-interaction

COPY src/ .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

