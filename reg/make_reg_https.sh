#!/usr/bin/env bash
docker service create \
  --name jupyteo-reg \
  --mount type=bind,src=/reg/registry/data,dst=/var/lib/registry \
  --mount type=bind,src=/reg/registry/security,dst=/etc/security \
  -e REGISTRY_HTTP_ADDR=0.0.0.0:443 \
  -e REGISTRY_HTTP_TLS_CERTIFICATE=/etc/security/fullchain1.pem \
  -e REGISTRY_HTTP_TLS_KEY=/etc/security/privkey1.pem \
  -e REGISTRY_AUTH=htpasswd \
  -e REGISTRY_AUTH_HTPASSWD_PATH=/etc/security/htpasswd \
  -e REGISTRY_AUTH_HTPASSWD_REALM="Registry Realm" \
  --publish published=443,target=443 \
  --constraint 'node.role==manager' \
  --replicas 1 \
  registry:2
