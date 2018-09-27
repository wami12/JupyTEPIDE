#!/usr/bin/env bash

docker build \
    -t jupytepide/user-spawned-notebook:dev \
    --build-arg DOCKER_NOTEBOOK_IMAGE=jupytepide/eodata-notebook:dev \
    -f dockerfile .