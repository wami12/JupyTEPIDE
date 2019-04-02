#!/usr/bin/env bash

source .env

net(){
docker network create --driver overlay --attachable jupyteo-net
}

vol(){
docker volume inspect ${DB_VOLUME_DATA} >/dev/null 2>&1 || docker volume create --name ${DB_VOLUME_DATA}
docker volume inspect ${POSTGIS_VOLUME_DATA} >/dev/null 2>&1 || docker volume create --name ${POSTGIS_VOLUME_DATA}
docker volume inspect ${GEOSERVER_VOLUME_DATA} >/dev/null 2>&1 || docker volume create --name ${GEOSERVER_VOLUME_DATA}
docker volume inspect ${NGINX_VOLUME_DATA} >/dev/null 2>&1 || docker volume create --name ${NGINX_VOLUME_DATA}
docker volume inspect ${PORTAINER_VOLUME_DATA} >/dev/null 2>&1 || docker volume create --name ${PORTAINER_VOLUME_DATA}
}

"$@"