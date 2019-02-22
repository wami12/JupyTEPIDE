#!/bin/bash
source docker-jupyteo.env

cd .. &&\

scipy(){
echo "-------------- START BUILD SCIPY-EXTENDED DOCKER --------------"
docker build -t ${DOCKER_SCIPY_EXT_IMAGE}:${DOCKER_VER} \
	--file docker/jupyteo/0_${DOCKER_SCIPY_NAME}_dockerfile \
	--build-arg DOCKER_STACK_VER=${DOCKER_STACK_VER} \
	. 2>&1 | tee docker/logs/${DOCKER_SCIPY_NAME}_${DOCKER_VER}.log
echo "------------ FINISHED BUILD SCIPY-EXTENDED DOCKER -------------"
}

geo(){
echo "-------------- START BUILD GEOSPATIAL DOCKER ------------------"
docker build -t ${DOCKER_GEO_IMAGE}:${DOCKER_VER} \
	--file docker/jupyteo/1_${DOCKER_GEO_NAME}_dockerfile \
	--build-arg DOCKER_VER=${DOCKER_VER} \
	. 2>&1 | tee docker/logs/${DOCKER_GEO_NAME}_${DOCKER_VER}.log
echo "------------- FINISHED BUILD GEOSPATIAL DOCKER ----------------"
}

eo(){
echo "-------------- START BUILD EO-DATA DOCKER ---------------------"
docker build -t ${DOCKER_EO_IMAGE}:${DOCKER_VER} \
	--file docker/jupyteo/2_${DOCKER_EO_NAME}_dockerfile \
	--build-arg DOCKER_VER=${DOCKER_VER} \
	. 2>&1 | tee docker/logs/${DOCKER_EO_NAME}_${DOCKER_VER}.log
echo "------------- FINISHED BUILD EO-DATA DOCKER -------------------"
}

sar(){
echo "-------------- START BUILD SAR DATA DOCKER --------------------"
docker build -t ${DOCKER_SAR_IMAGE}:${DOCKER_VER} \
	--file docker/jupyteo/3_${DOCKER_SAR_NAME}_dockerfile \
	--build-arg DOCKER_VER=${DOCKER_VER} \
	. 2>&1 | tee docker/logs/${DOCKER_SAR_NAME}_${DOCKER_VER}.log
echo "------------- FINISHED BUILD SAR DATA DOCKER ------------------"
}

deep(){
echo "----------- START BUILD MACHINE LEARNING DOCKER ---------------"
docker build -t ${DOCKER_DEEP_IMAGE}:${DOCKER_VER} \
	--file docker/jupyteo/4_${DOCKER_DEEP_NAME}_dockerfile \
	--build-arg DOCKER_VER=${DOCKER_VER} \
	. 2>&1 | tee docker/logs/${DOCKER_DEEP_NAME}_${DOCKER_VER}.log
echo "----------- FINISHED BUILD MACHINE LEARNING DOCKER -------------"
}

r(){
echo "-------------- START BUILD R DOCKER ----------------------------"
docker build -t ${DOCKER_R_IMAGE}:${DOCKER_VER} \
	--file docker/jupyteo/5_${DOCKER_R_NAME}_dockerfile \
	--build-arg DOCKER_VER=${DOCKER_VER} \
	. 2>&1 | tee docker/logs/${DOCKER_R_NAME}_${DOCKER_VER}.log
echo "------------- FINISHED BUILD R DOCKER -------------------------"
}

julia(){
echo "-------------- START BUILD DATA SCIENCE DOCKER ----------------"
docker build -t ${DOCKER_JULIA_IMAGE}:${DOCKER_VER} \
	--file docker/jupyteo/6_${DOCKER_JULIA_NAME}_dockerfile \
	--build-arg DOCKER_VER=${DOCKER_VER} \
	. 2>&1 | tee docker/logs/${DOCKER_JULIA_NAME}_${DOCKER_VER}.log
echo "------------- FINISHED BUILD DATA SCIENCE DOCKER --------------"
}

lab(){
echo "-------------- START BUILD DATA LAB DOCKER --------------------"
docker build -t ${DOCKER_LAB_IMAGE}:${DOCKER_VER} \
	--file docker/jupyteo/7_${DOCKER_LAB_NAME}_dockerfile \
	--build-arg DOCKER_VER=${DOCKER_VER} \
	. 2>&1 | tee docker/logs/${DOCKER_R_NAME}_${DOCKER_VER}.log
echo "------------- FINISHED BUILD DATA LAB DOCKER ------------------"
}

all(){
echo "-------------- START BUILD ALL-IN-ONE DOCKER ------------------"
docker build -t ${DOCKER_ALL_IMAGE}:${DOCKER_VER} \
	--file docker/jupyteo/8_${DOCKER_ALL_NAME}_dockerfile \
	--build-arg DOCKER_VER=${DOCKER_VER} \
	. 2>&1 | tee docker/logs/${DOCKER_ALL_NAME}_${DOCKER_VER}.log
echo "------------- FINISHED BUILD ALL-IN-ONE DOCKER ----------------"
}

test(){
echo "-------------- START BUILD TEST DOCKER ------------------"
docker build -t ${DOCKER_TEST_IMAGE}:${DOCKER_VER} \
	--file docker/jupyteo/99_${DOCKER_TEST_NAME}_dockerfile \
	--build-arg DOCKER_VER=${DOCKER_VER} \
	. 2>&1 | tee docker/logs/${DOCKER_TEST_NAME}_${DOCKER_VER}.log
echo "------------- FINISHED BUILD TEST DOCKER ----------------"
}

build_all(){
scipy
geo
eo
sar
deep
r
julia
lab
all
}

"$@"