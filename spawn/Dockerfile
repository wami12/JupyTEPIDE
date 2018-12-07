# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

# Pin to version of notebook image that includes start-singleuser.sh script
ARG DOCKER_NOTEBOOK_IMAGE
FROM $DOCKER_NOTEBOOK_IMAGE

# ------------------------- START TESTING --------------------------------

# ------------------------- END TESTING ----------------------------------

USER root
RUN cd /tmp && \
    git clone -b dev --single-branch https://github.com/wasat/JupyTEPIDE.git && \
    cp -rf /tmp/JupyTEPIDE/GUI/res/jupyter/static/* "/opt/conda/lib/python3.6/site-packages/notebook/static" && \
    cp -rf /tmp/JupyTEPIDE/GUI/res/pixiedust/* "/opt/conda/lib/python3.6/site-packages/pixiedust" && \
    cp -rf /tmp/JupyTEPIDE/GUI/res/pixiedust/* "/opt/conda/envs/python27/lib/python2.7/site-packages/pixiedust" && \
    cd JupyTEPIDE && \
    cp -R notebooks /home/jovyan/ && \
    cd GUI && \
    jupyter nbextension install jupytepide --user && \
    jupyter nbextension enable jupytepide/main --sys-prefix && \
    jupyter nbextension install --sys-prefix --py ipyparallel && \
    jupyter nbextension enable --sys-prefix --py ipyparallel && \
    jupyter serverextension enable --sys-prefix --py ipyparallel && \
    mkdir -p /home/jovyan/.ipython/profile_default/startup && \
    find "/home/jovyan/.ipython/profile_default/startup" -mindepth 1 -maxdepth 1 -print0 | xargs -0 rm -rf && \
    cp -a /tmp/JupyTEPIDE/scripts/startup/. /home/jovyan/.ipython/profile_default/startup/ && \
    mkdir -p /opt/jupytepide/scripts && \
    cp /tmp/JupyTEPIDE/scripts/metadata.py /opt/jupytepide/scripts/metadata.py  && \
    mkdir -p /home/jovyan/.jupytepide/conf/gui && \
    cp /tmp/JupyTEPIDE/GUI/jupytepide/code_snippets.json /home/jovyan/.jupytepide/conf/gui/code_snippets.json && \
    #/bin/bash -c "/opt/conda/envs/python27/bin/python2.7 /tmp/JupyTEPIDE/sdk/jupytep/add_paths.py" -q &&\
    cp -R /tmp/JupyTEPIDE /opt/ && \
    find /tmp -mindepth 1 -maxdepth 1 -print0 | xargs -0 rm -rf
#    fix-permissions /home/$NB_USER && \
#    fix-permissions /opt

# ENV PATH="/opt/var/JupyTEPIDE/sdk:${PATH}"

COPY docker-entrypoint.sh /srv/docker-entrypoint.sh
RUN chmod 777 /srv/docker-entrypoint.sh
ENTRYPOINT ["tini", "--", "/srv/docker-entrypoint.sh"]
CMD ["jupyterhub-singleuser"]

WORKDIR /home/$NB_USER
USER $NB_USER
