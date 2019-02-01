# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

# Pin to version of notebook image that includes start-singleuser.sh script
ARG DOCKER_NOTEBOOK_IMAGE
FROM $DOCKER_NOTEBOOK_IMAGE

USER root

# apt-get installs
RUN apt-get update -qq && \
    apt-get install -qq -y --no-install-recommends octave octave-image gnuplot ghostscript&& \
    apt-get autoremove -qq && \
    apt-get clean -qq && \
    rm -rf /var/lib/apt/lists/*

ENV OCTAVE_EXECUTABLE=/usr/bin/octave-cli

# ------------------------- START TESTING --------------------------------
USER $NB_UID

# Install Python 3 packages
# Remove pyqt and qt pulled in for matplotlib since we're only ever going to
# use notebook-friendly backends in these images
RUN conda install --quiet --yes -c conda-forge \
    'rasterio=1.0.14*' \
    'opencv=3.4.3*' \
    'scikit-image=0.14.1*' \
    'octave_kernel*' \
    'texinfo' && \
    pip install --upgrade pip &&\
    pip install -q --no-cache-dir --upgrade pixiedust && \
    /bin/bash -c "source activate python27 && pip install -q --no-cache-dir --upgrade pixiedust && source deactivate python27" && \
     conda clean -tipsy
# ------------------------- END TESTING ----------------------------------

USER root

WORKDIR /
RUN mkdir /tmp/jupyteo
COPY ./ ./tmp/jupyteo/

RUN cd /tmp && \
    cp -rf /tmp/jupyteo/GUI/res/jupyter/static/* "/opt/conda/lib/python3.6/site-packages/notebook/static" && \
    cp -rf /tmp/jupyteo/GUI/res/pixiedust/* "/opt/conda/lib/python3.6/site-packages/pixiedust" && \
    cp -rf /tmp/jupyteo/GUI/res/pixiedust/* "/opt/conda/envs/python27/lib/python2.7/site-packages/pixiedust" && \
    cd jupyteo && \
    cp -R notebooks /home/jovyan/ && \
    cd GUI && \
    jupyter nbextension install jupytepide --user && \
    jupyter nbextension enable jupytepide/main --sys-prefix && \
    jupyter nbextension install --sys-prefix --py ipyparallel && \
    jupyter nbextension enable --sys-prefix --py ipyparallel && \
    jupyter serverextension enable --sys-prefix --py ipyparallel  && \
    mkdir -p /home/jovyan/.ipython/profile_default/startup && \
    find "/home/jovyan/.ipython/profile_default/startup" -mindepth 1 -maxdepth 1 -print0 | xargs -0 rm -rf && \
    cp -a /tmp/jupyteo/scripts/startup/. /home/jovyan/.ipython/profile_default/startup/ && \
    mkdir -p /opt/jupyteo/scripts && \
    cp /tmp/jupyteo/scripts/metadata.py /opt/jupyteo/scripts/metadata.py && \
    mkdir -p /home/jovyan/.jupytepide/conf/gui && \
    cp -R /tmp/jupyteo/sdk /opt/jupyteo/sdk && \
    find /tmp -mindepth 1 -maxdepth 1 -print0 | xargs -0 rm -rf && \
    rm -rf /opt/JupyTEPIDE /opt/jupytepide
#    fix-permissions /home/$NB_USER && \
#    fix-permissions /opt


COPY spawn/docker-entrypoint.sh /srv/docker-entrypoint.sh
RUN chmod 777 /srv/docker-entrypoint.sh
ENTRYPOINT ["tini", "--", "/srv/docker-entrypoint.sh"]
CMD ["jupyterhub-singleuser"]

WORKDIR /home/$NB_USER
USER $NB_USER
