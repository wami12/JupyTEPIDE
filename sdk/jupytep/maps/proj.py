from osgeo import gdal


def reproject(input_raster, output_raster, dest_srs):
    input_file = gdal.Open(input_raster)
    gdal.Warp(output_raster, input_file, dstSRS=dest_srs)
