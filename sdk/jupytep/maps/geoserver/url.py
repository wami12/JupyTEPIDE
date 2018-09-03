import ipgetter as ipgetter


def get_public_ip():
    return ipgetter.myip()


def replace_ip(url):
    if "172.18.0.5:8080" in url:
        url = url.replace('172.18.0.5:8080', PUB_IP)
    return url


URL_GEOSERVER = 'http://172.18.0.5:8080/geoserver'
URL_REST = URL_GEOSERVER + '/rest/imports'
URL_WMS = URL_GEOSERVER + '/demo/wms'
PUB_IP = get_public_ip() + ":8090"
