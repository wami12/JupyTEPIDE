import os
import pwd


def get_host_username():
    return pwd.getpwuid(os.getuid())[0]


def get_login_username():
    return os.getenv('JUPYTERHUB_USER')
