.PHONY: build up down logs shell install

build:
	docker-compose build

up:
	docker-compose up -d

down:
	docker-compose down

logs:
	docker-compose logs -f app

shell:
	docker-compose exec app bash

install:
	poetry install

run:
	cd src && uvicorn main:app --host 0.0.0.0 --port 8000 --reload

dev:
	docker-compose up --build

