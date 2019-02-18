#!/bin/bash
source jupyteo/docker-jupyteo.env

cd .. &&\

scipy(){
docker build -t ${DOCKER_SCIPY_EXT_IMAGE}:${DOCKER_VER} \
	--file docker/jupyteo/0_${DOCKER_SCIPY_NAME}_dockerfile \
	--build-arg DOCKER_STACK_VER=${DOCKER_STACK_VER} \
	. 2>&1 | tee docker/logs/${DOCKER_SCIPY_NAME}_${DOCKER_VER}.log
}

geo(){
docker build -t ${DOCKER_GEO_IMAGE}:${DOCKER_VER} \
	--file docker/jupyteo/_${DOCKER_GEO_NAME}/dockerfile \
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