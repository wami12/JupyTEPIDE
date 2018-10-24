FROM debian:9-slim

LABEL maintainer="JupyTEP IDE Project <jupytep@wasat.pl>"

RUN apt-get update -qq && \
    apt-get install -qq -y apache2 libapache2-mod-wsgi-py3 python3-pip python3-mapnik mc nano && \
    apt-get autoremove -qq && \
    apt-get clean -qq && \
    rm -rf /var/lib/apt/lists/*

RUN pip3 install --quiet Flask

# apache2 sys envs
ENV APACHE_CONFDIR /etc/apache2
ENV APACHE_ENVVARS $APACHE_CONFDIR/envvars
ENV APACHE_RUN_USER www-data
ENV APACHE_RUN_GROUP www-data
ENV APACHE_RUN_DIR /var/run/apache2
ENV APACHE_PID_FILE $APACHE_RUN_DIR/apache2.pid
ENV APACHE_LOCK_DIR /var/lock/apache2
ENV APACHE_LOG_DIR /var/log/apache2
ENV LANG C

RUN a2enmod wsgi

COPY apache_wsgi /etc/apache2/sites-available/.
COPY flask /var/www/mydomain/wms_service.py
COPY flask /var/www/mydomain/.

RUN a2ensite flask_wsgi.conf && \
    a2dissite 000-default.conf && \
    service apache2 restart

EXPOSE 80

CMD ["apache2", "-D", "FOREGROUND"]