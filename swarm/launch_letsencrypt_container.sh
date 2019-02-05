#!/usr/bin/env bash
docker run \
  --cap-add=NET_ADMIN \
  --name nginx \
  -p 443:443 \
  -p 80:80 \
  --detach \
  -e EMAIL=jupytep@wasat.pl \
  -e URL=jupyteo.ga \
  -e SUBDOMAINS=reg,cloud,demo,try,notebooks,notebook,jupyter \
  -v nginx_volume:/config \
  --network jupyteo-net \
  --mount type=bind,src=/home/daniel/jupyteo-dev/swarm/letsencrypt_container_nginx.conf,dst=/config/nginx/site-confs/default \
  linuxserver/letsencrypt
