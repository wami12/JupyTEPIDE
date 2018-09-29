#!/usr/bin/env bash
docker service create \
  --name jupytepide-hub \
  --network upytepide-swarm-net \
  --mount type=bind,src=/var/run/docker.sock,dst=/var/run/docker.sock \
  --mount type=bind,src=/etc/jupyterhub,dst=/srv/jupyterhub \
  --mount src=nfsvolume,dst=/var/nfs \
  --publish 8000:8000 \
  --constraint 'node.role == manager' \
  --detach=true \
  jupytepide-hub:latest
