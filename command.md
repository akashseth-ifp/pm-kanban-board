
Commad to start postgresql docker container
```
docker run -d \
  --name postgresql \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=kanban \
  -p 5432:5432 \
  -v pgdata:/var/lib/postgresql \
  postgres:18.1
```
Command to stop postgresql docker container
```
docker stop postgresql
```

Find the Container ID or Name
```
docker ps
```

Stop the container
```
docker stop <container_id_or_name>
```

Force stop the container
```
docker kill <container_id_or_name>
```

Remove the container
```
docker rm <container_id_or_name>
```

Remove all containers
```
docker rm $(docker ps -a -q)
```

Remove all images
```
docker rmi $(docker images -q)
```

Remove all volumes
```
docker volume rm $(docker volume ls -q)
```

Remove all networks
```
docker network rm $(docker network ls -q)
```

Stop all running docker containers
```
docker stop $(docker ps -q)
```