#!/usr/bin/env bash

docker build \
    -t jupytepide/user-spawn-notebook:test \
    --build-arg DOCKER_NOTEBOOK_IMAGE=jupytepide/eodata-notebook:1.3.0 \
    -f Dockerfile .