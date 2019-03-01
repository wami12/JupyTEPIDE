from jupytep.config.env import get_login_username

PUB_HOST = "https://try.jupyteo.com"
# Local urls
URL_GEOSERVER_LOCAL = 'http://jupyteo-geoserver:8080'


def get_file_url(file_path):
    # "https://try.jupyteo.com/user/+ "nazwa_uzytkownika"+ /files/ +
    user = get_login_username()
    file_path = file_path.replace("/home/jovyan/", "").replace("~/", "")
    url = PUB_HOST + "/user/%s/files/%s" % (user, file_path)
    return url
