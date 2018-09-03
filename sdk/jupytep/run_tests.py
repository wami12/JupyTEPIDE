from jupytep.maps.content import show_on_map
from jupytep.maps.geoserver.loader import load_geotif

geotiff = '/opt/pub/shared/geotiffs/test1_rgb.tif'

load_geotif(geotiff)
show_on_map(geotiff)
