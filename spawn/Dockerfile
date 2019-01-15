# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

# Pin to version of notebook image that includes start-singleuser.sh script
ARG DOCKER_NOTEBOOK_IMAGE
FROM $DOCKER_NOTEBOOK_IMAGE

# ------------------------- START TESTING --------------------------------
USER $NB_UID

# Install Python 3 packages
# Remove pyqt and qt pulled in for matplotlib since we're only ever going to
# use notebook-friendly backends in these images

RUN conda install --quiet --yes -c conda-forge \
    'rasterio=1.0.9*' \
    'opencv=3.4.3*' \
    'scikit-image=0.14.1*' && \
    pip install --upgrade pip &&\
    pip install -q --no-cache-dir --upgrade pixiedust && \
    /bin/bash -c "source activate python27 && pip install -q --no-cache-dir --upgrade pixiedust && source deactivate python27" && \
     conda clean -tipsy
# ------------------------- END TESTING ----------------------------------

USER root
RUN cd /tmp && \
    git clone -b dev --single-branch https://github.com/wasat/JupyTEPIDE.git && \
    cp -rf /tmp/JupyTEPIDE/GUI/res/jupyter/static/* "/opt/conda/lib/python3.6/site-packages/notebook/static" && \
#    cp -rf /tmp/JupyTEPIDE/GUI/res/pixiedust/* "/opt/conda/lib/python3.6/site-packages/pixiedust" && \
#    cp -rf /tmp/JupyTEPIDE/GUI/res/pixiedust/* "/opt/conda/envs/python27/lib/python2.7/site-packages/pixiedust" && \
    cd JupyTEPIDE && \
    cp -R notebooks /home/jovyan/ && \
    cd GUI && \
    jupyter nbextension install jupytepide --user && \
    jupyter nbextension enable jupytepide/main --sys-prefix && \
    jupyter nbextension install --sys-prefix --py ipyparallel && \
    jupyter nbextension enable --sys-prefix --py ipyparallel && \
    jupyter serverextension enable --sys-prefix --py ipyparallel  && \
    mkdir -p /home/jovyan/.ipython/profile_default/startup && \
    find "/home/jovyan/.ipython/profile_default/startup" -mindepth 1 -maxdepth 1 -print0 | xargs -0 rm -rf && \
    cp -a /tmp/JupyTEPIDE/scripts/startup/. /home/jovyan/.ipython/profile_default/startup/ && \
    mkdir -p /opt/jupytepide/scripts && \
    cp /tmp/JupyTEPIDE/scripts/metadata.py /opt/jupytepide/scripts/metadata.py && \
    mkdir -p /home/jovyan/.jupytepide/conf/gui && \
    cp /tmp/JupyTEPIDE/GUI/jupytepide/code_snippets.json /home/jovyan/.jupytepide/conf/gui/code_snippets.json && \
    cp -R /tmp/JupyTEPIDE /opt/ && \
    ls && \
    find /tmp -mindepth 1 -maxdepth 1 -print0 | xargs -0 rm -rf
#    fix-permissions /home/$NB_USER && \
#    fix-permissions /opt


COPY docker-entrypoint.sh /srv/docker-entrypoint.sh
RUN chmod 777 /srv/docker-entrypoint.sh
ENTRYPOINT ["tini", "--", "/srv/docker-entrypoint.sh"]
CMD ["jupyterhub-singleuser"]

WORKDIR /home/$NB_USER
USER $NB_USER
