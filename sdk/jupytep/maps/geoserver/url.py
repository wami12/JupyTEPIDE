def replace_pub_host(url):
    if "jupytepide-geoserver:8080" in url:
        url = url.replace('http://jupytepide-geoserver:8080', PUB_HOST)
    return url


URL_GEOSERVER = 'http://jupytepide-geoserver:8080/geoserver'
URL_REST = URL_GEOSERVER + '/rest/imports'
URL_WMS = URL_GEOSERVER + '/demo/wms'
PUB_HOST = "https://try.jupytepide.ga"
