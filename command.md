
Commad to start postgresql docker container
```
docker run -d \
  --name postgresql \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=kanban \
  -p 5432:5432 \
  -v pgdata:/var/lib/postgresql/data \
  postgres:16
```
