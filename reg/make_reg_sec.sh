#!/usr/bin/env bash
docker run -d \
  -p 5000:5000 \
  --name registry \
  -v /reg/registry/data:/var/lib/registry \
  -v /reg/registry/security:/etc/security \
  -e REGISTRY_HTTP_TLS_CERTIFICATE=/etc/security/fullchain1.pem \
  -e REGISTRY_HTTP_TLS_KEY=/etc/security/privkey1.pem \
  -e REGISTRY_AUTH=htpasswd \
  -e REGISTRY_AUTH_HTPASSWD_PATH=/etc/security/htpasswd \
  -e REGISTRY_AUTH_HTPASSWD_REALM="Registry Realm" \
  --restart always \
  registry:2
