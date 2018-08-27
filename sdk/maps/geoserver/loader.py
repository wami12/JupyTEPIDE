from sdk.maps.geoserver.rest import *


def load_geotif(geotiff_name):
    response_init = post_init_import()
    print(response_init)
    id = get_import_id(response_init)
    print(id)
    response_tiff = post_tiff_curl(id, geotiff_name)
    print(response_tiff)
    response_final = post_import_final(id)
    print(response_final.content)


load_geotif('test_snappy.tif')
