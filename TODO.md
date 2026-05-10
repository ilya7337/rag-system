f# TODO

- [ ] Поднять фронтенд в Docker из папки `src/frontend` (Vite/React)
  - [x] Добавить `docker/frontend/Dockerfile` для сборки статических ассетов в `src/static`
- [x] Добавить сервис(ы) во `docker-compose.yml`, чтобы `npm ci && npm run build` выполнялись при `docker-compose up --build`

  - [ ] Проверить, что backend продолжает раздавать `src/static` (смонтировано в контейнер app)


