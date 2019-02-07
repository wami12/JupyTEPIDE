#!/usr/bin/env bash
sudo docker run \
  -d \
  -e ENV_DOCKER_REGISTRY_HOST=reg.jupyteo.com \
  -e ENV_DOCKER_REGISTRY_PORT=443 \
  -e ENV_DOCKER_REGISTRY_USE_SSL=1 \
  -p 8080:80 \
  konradkleine/docker-registry-frontend:v2