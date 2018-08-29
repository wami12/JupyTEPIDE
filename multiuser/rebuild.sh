#!/usr/bin/env bash

docker-compose down
docker rmi -f jupytepide-hub
docker rmi -f jupytepide-hub-user

make build
make jupytep_user_spawn_image

cd /opt
git clone -b dev --single-branch https://github.com/wasat/JupyTEPIDE.git

docker-compose up -d
docker ps -a
