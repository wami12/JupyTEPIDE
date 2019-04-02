#!/usr/bin/env bash
docker run \
  --cap-add=NET_ADMIN \
  --name nginx-jupyteo \
  -p 443:443 \
  -p 80:80 \
  --detach \
  -e EMAIL=jupytep@wasat.pl \
  -e URL=jupyteo.ga \
  -e ONLY_SUBDOMAINS=true \
  -e SUBDOMAINS=www,site,web,website \
  -v /home/daniel/website/webroot:/config \
  linuxserver/letsencrypt
