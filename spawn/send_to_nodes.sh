#!/usr/bin/env bash

#docker save jupytepide/jupyterhub:0.9.2-1.3 | bzip2 | pv | \
#     tee >(ssh -i ~/.ssh/jupytep-swarm.key eouser@192.168.0.10 'bunzip2 | docker load')
#     >(ssh -i ~/.ssh/jupytep-swarm.key eouser@192.168.0.11 'bunzip2 | docker load')


docker save jupytepide/user-spawn-notebook:dev | bzip2 | pv | \
     scp -C -i ~/.ssh/jupytep-swarm.key eouser@192.168.0.11 | ssh -i ~/.ssh/jupytep-swarm.key eouser@192.168.0.10 'bunzip2 | docker load'

docker save jupytepide/user-spawn-notebook:dev | bzip2 | pv | \
     scp -C -i ~/.ssh/jupytep-swarm.key eouser@192.168.0.11 | ssh -i ~/.ssh/jupytep-swarm.key eouser@192.168.0.11 'bunzip2 | docker load'