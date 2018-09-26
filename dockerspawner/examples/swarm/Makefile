# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

include .env

.DEFAULT_GOAL=build

network:
	@docker network create --driver overlay --attachable jupytepide-swarm-net
#	\
#	--gateway 172.18.0.1 --subnet 172.18.0.0/24