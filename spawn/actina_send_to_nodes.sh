#!/bin/bash

push_all()
{
	VER=$1
	scipy ${VER}
	geo ${VER}
	eo ${VER}
	sar ${VER}
	deep ${VER}
	r ${VER}
	julia ${VER}
	lab ${VER}
	all ${VER}
}

scipy(){
	VER=$1
	IMAGE=reg.jupyteo.com/scipy-ext-notebook:${VER}
	echo "START SEND TO ACTINA NODES: "${IMAGE}
	push ${IMAGE}
}

geo(){
	VER=$1
	IMAGE=reg.jupyteo.com/geospatial-notebook:${VER}
	echo "START SEND TO ACTINA NODES: "${IMAGE}
	push ${IMAGE}
}

eo(){
	VER=$1
	IMAGE=reg.jupyteo.com/eodata-notebook:${VER}
	echo "START SEND TO ACTINA NODES: "${IMAGE}
	push ${IMAGE}
}

sar(){
	VER=$1
	IMAGE=reg.jupyteo.com/sar-notebook:${VER}
	echo "START SEND TO ACTINA NODES: "${IMAGE}
	push ${IMAGE}
}

deep(){
	VER=$1
	IMAGE=reg.jupyteo.com/deep-learning-notebook:${VER}
	echo "START SEND TO ACTINA NODES: "${IMAGE}
	push ${IMAGE}
}

r(){
	VER=$1
	IMAGE=reg.jupyteo.com/r-notebook:${VER}
	echo "START SEND TO ACTINA NODES: "${IMAGE}
	push ${IMAGE}
}

julia(){
	VER=$1
	IMAGE=reg.jupyteo.com/julia-notebook:${VER}
	echo "START SEND TO ACTINA NODES: "${IMAGE}
	push ${IMAGE}
}

lab(){
	VER=$1
	IMAGE=reg.jupyteo.com/data-lab-notebook:${VER}
	echo "START SEND TO ACTINA NODES: "${IMAGE}
	push ${IMAGE}
}

all(){
	VER=$1
	IMAGE=reg.jupyteo.com/all-in-one-notebook:${VER}
	echo "START SEND TO ACTINA NODES: "${IMAGE}
	push ${IMAGE}
}

push(){
DOCKER_IMG=$1
TIMEFORMAT='It takes %R seconds to complete push and pull'
time {
	echo "Push to Docker Registry: "${DOCKER_IMG}
    docker push ${DOCKER_IMG}

    echo "Pull on Actina VM-02: "${DOCKER_IMG}
    ssh -i ~/.ssh/jupyteo-swarm-actina daniel@192.168.1.202 'docker rmi -f '${DOCKER_IMG}'; docker pull '${DOCKER_IMG}

    echo "Pull on Actina VM-03: "${DOCKER_IMG}
    ssh -i ~/.ssh/jupyteo-swarm-actina daniel@192.168.1.203 'docker rmi -f '${DOCKER_IMG}'; docker pull '${DOCKER_IMG}
 }
}

"$@"