# base image: jupyterhub
# this is built by docker-compose
# from the root of this repo
ARG JUPYTERHUB_VERSION=0.9.2
FROM jupyterhub/jupyterhub:${JUPYTERHUB_VERSION}
# install dockerspawner dummyauthenticator
RUN pip install --no-cache \
    dockerspawner==0.10.0 \
    jupyterhub-dummyauthenticator

RUN cd /tmp && \
    git clone -b dev --single-branch https://github.com/wasat/JupyTEPIDE.git && \
    cp -rf /tmp/JupyTEPIDE/GUI/res/hub/* "/opt/conda/share/jupyterhub/" && \
    find /tmp -mindepth 1 -maxdepth 1 -print0 | xargs -0 rm -rf

# load example configuration
ADD ./jupyterhub_config.py /srv/jupyterhub/jupyterhub_config.py
