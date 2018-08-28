from pathlib import PurePosixPath

from owslib.wms import WebMapService

wms_url_base = 'http://89.250.194.14:8090/geoserver/demo/wms'


def get_bbox(layer_name):
    wms = WebMapService(wms_url_base, version='1.1.1')
    bbox = wms[layer_name].boundingBoxWGS84
    bbox_str = str(bbox[0]) + "," + str(bbox[1]) + "," + str(bbox[2]) + "," + str(bbox[3])
    return bbox_str


def get_layer_name(tiff_path):
    filename = PurePosixPath(tiff_path).stem
    return filename


def get_wms(tiff_path):
    layer = get_layer_name(tiff_path)
    bbox = get_bbox(layer)
    wms_url = wms_url_base + "?service=WMS&version=1.1.1&request=GetMap&layers=demo:%s&" \
                             "styles=&bbox=%s&width=768&height=768&srs=EPSG:4326&format=image/png" % (layer, bbox)
    print(wms_url)
    return wms_url
