FROM jupyter/minimal-notebook:30f16d52126f
ARG JUPYTERHUB_VERSION=0.8.1

LABEL maintainer="JupyTEP IDE Project <jupytep@wasat.pl>"

USER root

# Fix sh
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

# apt-get installs
RUN apt-get update -qq && \
    apt-get install -y -qq apt-utils python3-pip &&\
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN pip3 install --no-cache \
    jupyterhub==$JUPYTERHUB_VERSION

CMD ["start-singleuser.sh"]