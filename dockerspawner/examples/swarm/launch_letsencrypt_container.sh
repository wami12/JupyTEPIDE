#!/usr/bin/env bash
docker run \
  --cap-add=NET_ADMIN \
  --name nginx \
  -p 443:8000 \
  -p 80:8000 \
  --detach \
  -e EMAIL=your_email@domain.edu \
  -e URL=jupytepide.ga \
  -v nginx_volume:/config \
  --network jupytepide-swarm-net \
  --mount type=bind,src=/home/eouser/dockerspawner/examples/swarm/letsencrypt_container_nginx.conf,dst=/config/nginx/site-confs/default \
  linuxserver/letsencrypt
