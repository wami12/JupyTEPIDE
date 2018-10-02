# base image: jupyterhub
# this is built by docker-compose
# from the root of this repo
ARG JUPYTERHUB_VERSION=0.9.2
FROM jupyterhub/jupyterhub:${JUPYTERHUB_VERSION}
# install dockerspawner from the current repo
# ADD . /tmp/dockerspawner
# RUN pip install --upgrade pip
# RUN pip install --no-cache /tmp/dockerspawner
RUN pip install --no-cache dockerspawner==0.10.0
# install dummyauthenticator
RUN pip install --no-cache jupyterhub-dummyauthenticator
# load example configuration
ADD ./jupyterhub_config.py /srv/jupyterhub/jupyterhub_config.py
