FROM debian:9-slim

RUN apt-get update
RUN apt-get install apache2 -y
RUN apt-get install libapache2-mod-wsgi-py3 -y
RUN apt-get install python3-pip -y
RUN apt-get install python3-mapnik -y
RUN pip3 install Flask

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
RUN a2enmod ssl
RUN mkdir /etc/apache2/ssl

COPY apache_wsgi /etc/apache2/ssl/apache.crt
COPY apache_wsgi /etc/apache2/ssl/.
COPY apache_wsgi /etc/apache2/sites-available/flask_wsgi.conf
COPY flask /var/www/mydomain/wms_service.py
COPY flask /var/www/mydomain/.

RUN a2ensite flask_wsgi.conf
RUN service apache2 restart

EXPOSE 443

CMD ["apache2", "-D", "FOREGROUND"]