# base image: jupyterhub
# this is built by docker-compose
# from the root of this repo
ARG JUPYTERHUB_VERSION=0.9.2
FROM jupyterhub/jupyterhub:${JUPYTERHUB_VERSION}
# install dockerspawner dummyauthenticator
RUN pip install -q --no-cache \
	dockerspawner==0.10.0 \
    oauthenticator==0.8.* \
    jupyterhub-dummyauthenticator

WORKDIR /tmp

RUN mkdir /tmp/jupyteo
COPY ./ /tmp/jupyteo/

RUN cd /tmp &&\
    cp -rf /tmp/jupyteo/GUI/res/hub/* "/opt/conda/share/jupyterhub/" &&\
    # cd /tmp/jupyteo/dockerspawner  &&\
    # pip install -q --prefix /opt/conda/ .  &&\
    find /tmp -mindepth 1 -maxdepth 1 -print0 | xargs -0 rm -rf

# load example configuration
ADD ./hub/jupyterhub_config.py /srv/jupyterhub/jupyterhub_config.py
ADD ./hub/cull_idle_servers.py /srv/jupyterhub/cull_idle_servers.py
