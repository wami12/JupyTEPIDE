#!/usr/bin/env bash

cd .. &&\

docker build \
    -t jupytepide/ubuntu:test \
    --build-arg DOCKER_NOTEBOOK_IMAGE=ubuntu:latest \
    -f testing/Dockerfile .