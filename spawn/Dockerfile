# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

# Pin to version of notebook image that includes start-singleuser.sh script
ARG DOCKER_NOTEBOOK_IMAGE
FROM $DOCKER_NOTEBOOK_IMAGE

# ------------------------- START TESTING --------------------------------
USER root

# Fix sh
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

USER $NB_USER

# Install Tensorflow
RUN conda install --quiet --yes \
    -c anaconda markdown  \
    'tensorflow=1.5*' \
    'keras=2.1*' \
    scikit-learn && \
    conda clean -tipsy

RUN conda install --quiet --yes -c conda-forge \
    'libgdal=2.2.4*' \
    'gdal=2.2.4*' && \
    conda clean -tipsy


RUN mkdir /opt/scilab  && \
    cd  /opt/scilab && \
    wget --quiet http://www.scilab.org/download/6.0.1/scilab-6.0.1.bin.linux-x86_64.tar.gz && \
    tar -xzf scilab-6.0.1.bin.linux-x86_64.tar.gz && \
    rm -rf scilab-6.0.1.bin.linux-x86_64.tar.gz && \
    cd scilab-6.0.1 && \
    echo "PATH=$PATH:/opt/scilab/scilab-6.0.1/bin" >> ~/.bashrc && \
    echo "PATH=$PATH:/opt/scilab/scilab-6.0.1/bin" >> ~/.profile && \
    mkdir -p ~/.local/share/applications && \
    sed -i 's/^Terminal=false$/Terminal=true/' /opt/scilab/scilab-6.0.1/share/applications/{scilab,scinotes,xcos}.desktop && \
    cp -a /opt/scilab/scilab-6.0.1/share/{icons,applications,mime} ~/.local/share/ && \
    update-mime-database ~/.local/share/mime/

ENV SCILAB_EXECUTABLE /opt/scilab/scilab-6.0.1/bin/scilab-adv-cli

RUN pip install --no-cache scilab_kernel

# ------------------------- END TESTING ----------------------------------
# Use custom startup script
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
    cp /tmp/JupyTEPIDE/scripts/metadata.py /opt/jupytepide/scripts/metadata.py && \
    mkdir -p /home/jovyan/.jupytepide/conf/gui && \
    cp /tmp/JupyTEPIDE/GUI/jupytepide/code_snippets.json /home/jovyan/.jupytepide/conf/gui/code_snippets.json && \
    cp -R /tmp/JupyTEPIDE /opt/ && \
    find /tmp -mindepth 1 -maxdepth 1 -print0 | xargs -0 rm -rf
#    fix-permissions /home/$NB_USER && \
#    fix-permissions /opt

COPY docker-entrypoint.sh /srv/docker-entrypoint.sh
RUN chmod 777 /srv/docker-entrypoint.sh
ENTRYPOINT ["tini", "--", "/srv/docker-entrypoint.sh"]
CMD ["jupyterhub-singleuser"]

WORKDIR /home/$NB_USER
USER $NB_USER
