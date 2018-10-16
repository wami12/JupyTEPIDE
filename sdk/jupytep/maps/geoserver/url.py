import ipgetter as ipgetter


def get_public_ip():
    return ipgetter.myip()


def replace_ip(url):
    if "jupytepide-geoserver:8080" in url:
        url = url.replace('jupytepide-geoserver:8080', PUB_IP)
    return url


URL_GEOSERVER = 'http://jupytepide-geoserver:8080/geoserver'
URL_REST = URL_GEOSERVER + '/rest/imports'
URL_WMS = URL_GEOSERVER + '/demo/wms'
PUB_IP = get_public_ip() + ":8090"
