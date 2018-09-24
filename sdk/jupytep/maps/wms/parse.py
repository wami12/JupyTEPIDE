from pathlib import PurePosixPath

from owslib.wms import WebMapService

from jupytep.maps.geoserver.url import URL_WMS, replace_ip


def get_bbox(layer_name):
    wms = WebMapService(URL_WMS, version='1.1.1')
    bbox = wms[layer_name].boundingBoxWGS84
    bbox_str = str(bbox[0]) + "," + str(bbox[1]) + "," + str(bbox[2]) + "," + str(bbox[3])
    return bbox_str


def get_layer_name(tiff_path):
    filename = PurePosixPath(tiff_path).stem
    return str(filename)


def get_wms(tiff_path):
    layer = get_layer_name(tiff_path)
    bbox = get_bbox(layer)
    wms_url = URL_WMS + "?service=WMS&version=1.1.1&request=GetMap&layers=demo:%s&" \
                        "styles=&bbox=%s&width=768&height=768&srs=EPSG:4326&format=image/png" % (layer, bbox)
    # print(wms_url)
    return replace_ip(wms_url)


def get_wms_base_url():
    return replace_ip(URL_WMS)
