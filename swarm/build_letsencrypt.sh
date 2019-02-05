#!/usr/bin/env bash

docker volume create --driver local nginx_volume

docker run \
  --cap-add=NET_ADMIN \
  --name nginx \
  -p 80:80 \
  -e EMAIL=jupyteo@wasat.pl \
  -e URL=jupyteo.ga \
  -e SUBDOMAINS=www \
  -v nginx_volume:/config \
  linuxserver/letsencrypt