#!/bin/bash
source docker.env

cd .. &&\

sci(){
docker build -t ${DOCKER_SCI_IMAGE}:${DOCKER_VER} \
	--file docker/latest/1_${DOCKER_SCI_NAME}/dockerfile \
	--build-arg DOCKER_VER=${DOCKER_VER} \
	. 2>&1 | tee docker/logs/${DOCKER_SCI_NAME_}${DOCKER_VER}.log
}

geo(){
docker build -t ${DOCKER_GEO_IMAGE}:${DOCKER_VER} \
	--file docker/latest/2_${DOCKER_GEO_NAME}/dockerfile \
	--build-arg DOCKER_VER=${DOCKER_VER} \
	. 2>&1 | tee docker/logs/${DOCKER_GEO_NAME}_${DOCKER_VER}.log
}

eo(){
docker build -t ${DOCKER_EO_IMAGE}:${DOCKER_VER} \
	--file docker/latest/3_${DOCKER_EO_NAME}/dockerfile \
	--build-arg DOCKER_VER=${DOCKER_VER} \
	. 2>&1 | tee docker/logs/${DOCKER_EO_NAME}_${DOCKER_VER}.log
}

"$@"