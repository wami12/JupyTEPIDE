from maps.geoserver.rest import *


def load_geotif(geotiff_name):
    response_init = post_init_import()
    # print("Init import - DONE")
    print(response_init)
    id = get_import_id(response_init)
    # print("Import ID: %s " % id)
    response_tiff = post_tiff_curl(id, geotiff_name)
    # print("Load tiff - DONE")
    # print(response_tiff)
    response_final = post_import_final(id)
    print("Finish import for ID: %s " % id)
    # print(response_final.content)


# load_geotif("/pub/shared/tifs/test_snappy.tif")

# def test_func():
#     get_wms("/home/jovyan/shared/tifs/test_snappy.tif")
#
#
# test_func()
