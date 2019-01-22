import os
import uuid
from shutil import copyfile

import gdal
import numpy as np
from IPython.display import Javascript

from jupytep.config.urls import PUB_HOST
from jupytep.maps.proj import reproject


class RenderMap:

    def __init__(self, file_path, name="RenderMap", style="rgb", nodata="-9999"):
        self.name = name
        self.uniqnam = uuid.uuid4()
        self.destfile = "/opt/var/mapnik/%s" % self.uniqnam
        copyfile(file_path, self.destfile)
        self.style = style
        self.nodata = nodata
        self.stats = self.get_stats()

    def get_stats(self):
        im = gdal.Open(self.destfile)
        im_arr = im.ReadAsArray()
        self.nodata = im_arr.min()
        min_val = im_arr[im_arr > self.nodata].min()
        max_val = int(np.percentile(im_arr, 95))
        ret = "%s|%s" % (min_val, max_val)
        return ret

    def reproject(self):
        tmp_file = "/opt/var/mapnik/%s%s" % (self.uniqnam, "_tmp")
        os.rename(self.destfile, tmp_file)

        input_raster = tmp_file
        output_raster = self.destfile
        dest_srs = 'EPSG:3857'
        reproject(input_raster, output_raster, dest_srs)
        os.remove(tmp_file)

    def show_on_map(self):
        ret = Javascript("""
            try{
                Jupytepide.map_removeLayer('Map Renderer');
            }
            catch(err){ //if there is nothing to remove do nothing    
            }
            Jupytepide.map_addWmsLayer('%s/mapnik/',
            {layers:'renderer',format:'image/png',transparent:true, path:'%s', style:'%s', delta:'%s', nodata:
            '%s'},'%s');
            """ % (PUB_HOST, self.destfile, self.style, self.stats, self.nodata, self.name))
        print(self.destfile)
        return ret

    def __del__(self):
        os.remove(self.destfile)
