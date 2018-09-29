#!/bin/bash

docker service rm $(docker service ls -q)
docker rm -f $(docker ps -a -q)
docker-compose down
#docker rmi -f jupytepide-hub:latest
#docker-compose build
docker-compose up -d
docker ps -a
