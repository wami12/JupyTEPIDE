#!/usr/bin/env bash
docker volume create --driver local \
    --opt type=nfs4 \
    --opt o=addr=192.168.0.13,rw \
    --opt device=:/var/nfs \
    nfsvolume
