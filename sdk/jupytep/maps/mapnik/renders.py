import os
import uuid
from shutil import copyfile

import gdal
import numpy as np
from IPython.display import Javascript


class RenderMap:

    def __init__(self, file_path, name="RenderMap", style="rb", nodata="-9999"):
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

    def print(self):
        ret = Javascript("""
            try{
                Jupytepide.map_removeLayer('Map Renderer');
            }
            catch(err){ //if there is nothing to remove do nothing    
            }
            Jupytepide.map_addWmsLayer('https://try.jupytepide.ga/mapnik/',
            {layers:'renderer',format:'image/png',transparent:true, path:'%s', style:'%s', delta:'%s', nodata:
            '%s'},'%s');
            """ % (self.destfile, self.style, self.stats, self.nodata, self.name))
        return ret

    def __del__(self):
        os.remove(self.destfile)
