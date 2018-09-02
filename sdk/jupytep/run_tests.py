from jupytep.maps.wms.parse import get_wms

# load_geotif("/pub/shared/tifs/test_snappy.tif")
wms = get_wms("/home/jovyan/shared/tifs/test_snappy.tif")
print(wms)
