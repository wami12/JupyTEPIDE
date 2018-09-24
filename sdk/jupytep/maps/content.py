from jupytep.maps.leaflet.layer import WMSLayer
from jupytep.maps.wms.parse import get_wms_base_url, get_layer_name


def show_on_map(geotiff_path):
    wmsL = WMSLayer()
    wms_url = get_wms_base_url()
    layer_name = get_layer_name(geotiff_path)
    layer = 'demo:' + layer_name
    parameters = {'layers': layer, 'format': 'image/png', 'transparent': 'true'}
    wmsL.add_wms_layer(wms_url, layer_name, parameters)
    wmsL.show_layer()
