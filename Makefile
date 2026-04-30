.PHONY: build up down logs shell install run dev create-admin

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

create-admin:
ifdef login
ifndef password
	$(error password is undefined. Use: make create-admin login=LOGIN password=PASSWORD)
endif
	@cd src && python create_admin.py $(login) $(password)
else
	$(error login is undefined. Use: make create-admin login=LOGIN password=PASSWORD)
endif

