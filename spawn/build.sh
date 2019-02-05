#!/usr/bin/env bash

cd .. &&\

docker build \
    -t jupytepide/user-spawn-notebook:test \
    --build-arg DOCKER_NOTEBOOK_IMAGE=jupytepide/eodata-notebook:1.3.5 \
    -f spawn/Dockerfile .