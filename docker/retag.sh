#!/bin/bash

all()
{
	VER_1=$1
	VER_2=$2
	scipy ${VER_1} ${VER_2}
	geo ${VER_1} ${VER_2}
	eo ${VER_1} ${VER_2}
	sar ${VER_1} ${VER_2}
	deep ${VER_1} ${VER_2}
	r ${VER_1} ${VER_2}
	julia ${VER_1} ${VER_2}
	lab ${VER_1} ${VER_2}
	all-in-one ${VER_1} ${VER_2}
}

scipy(){
	VER_1=$1
	VER_2=$2
	IMAGE_1=reg.jupyteo.com/scipy-ext-notebook:${VER_1}
	IMAGE_2=reg.jupyteo.com/scipy-ext-notebook:${VER_2}
	echo "START RETAG FORM: "${IMAGE_1} " TO: "${IMAGE_2}
	tag ${IMAGE_1} ${IMAGE_2}
}

geo(){
	VER_1=$1
	VER_2=$2
	IMAGE_1=reg.jupyteo.com/geospatial-notebook:${VER_1}
	IMAGE_2=reg.jupyteo.com/geospatial-notebook:${VER_2}
	echo "START RETAG FORM: "${IMAGE_1} " TO: "${IMAGE_2}
	tag ${IMAGE_1} ${IMAGE_2}
}

eo(){
	VER_1=$1
	VER_2=$2
	IMAGE_1=reg.jupyteo.com/eodata-notebook:${VER_1}
	IMAGE_2=reg.jupyteo.com/eodata-notebook:${VER_2}
	echo "START RETAG FORM: "${IMAGE_1} " TO: "${IMAGE_2}
	tag ${IMAGE_1} ${IMAGE_2}
}

sar(){
	VER_1=$1
	VER_2=$2
	IMAGE_1=reg.jupyteo.com/sar-notebook:${VER_1}
	IMAGE_2=reg.jupyteo.com/sar-notebook:${VER_2}
	echo "START RETAG FORM: "${IMAGE_1} " TO: "${IMAGE_2}
	tag ${IMAGE_1} ${IMAGE_2}
}

deep(){
	VER_1=$1
	VER_2=$2
	IMAGE_1=reg.jupyteo.com/deep-learning-notebook:${VER_1}
	IMAGE_2=reg.jupyteo.com/deep-learning-notebook:${VER_2}
	echo "START RETAG FORM: "${IMAGE_1} " TO: "${IMAGE_2}
	tag ${IMAGE_1} ${IMAGE_2}
}

r(){
	VER_1=$1
	VER_2=$2
	IMAGE_1=reg.jupyteo.com/r-notebook:${VER_1}
	IMAGE_2=reg.jupyteo.com/r-notebook:${VER_2}
	echo "START RETAG FORM: "${IMAGE_1} " TO: "${IMAGE_2}
	tag ${IMAGE_1} ${IMAGE_2}
}

julia(){
	VER_1=$1
	VER_2=$2
	IMAGE_1=reg.jupyteo.com/julia-notebook:${VER_1}
	IMAGE_2=reg.jupyteo.com/julia-notebook:${VER_2}
	echo "START RETAG FORM: "${IMAGE_1} " TO: "${IMAGE_2}
	tag ${IMAGE_1} ${IMAGE_2}
}

lab(){
	VER_1=$1
	VER_2=$2
	IMAGE_1=reg.jupyteo.com/data-lab-notebook:${VER_1}
	IMAGE_2=reg.jupyteo.com/data-lab-notebook:${VER_2}
	echo "START RETAG FORM: "${IMAGE_1} " TO: "${IMAGE_2}
	tag ${IMAGE_1} ${IMAGE_2}
}

all-in-one(){
	VER_1=$1
	VER_2=$2
	IMAGE_1=reg.jupyteo.com/all-in-one-notebook:${VER_1}
	IMAGE_2=reg.jupyteo.com/all-in-one-notebook:${VER_2}
	echo "START RETAG FORM: "${IMAGE_1} " TO: "${IMAGE_2}
	tag ${IMAGE_1} ${IMAGE_2}
}

tag(){
IMG_1=$1
IMG_2=$2
TIMEFORMAT='It takes %R seconds to complete'
time {
    docker tag ${IMG_1} ${IMG_2}
 }
}

"$@"