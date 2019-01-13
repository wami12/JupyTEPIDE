import json
import os
import re
from IPython.display import HTML, display
from shutil import copyfile


class Base:
    wms_attr = {
        'layers': '',
        'styles': '',
        'format': 'image/png',
        'transparent': True,
        'version': '1.1.1',
        'crs': 'null',
        'uppercase': False
    }

    params = {
        'color': 'red',
        'fillColor': '#f03',
        'fillOpacity': 0.5
    }

    def _attrib2string(self):
        ls = []
        for k, v in self.wms_attr.items():
            s = ''
            if type(v) == bool:
                val = str(v).lower()
            else:
                val = '\'' + v + '\''
            s += k + ':' + val
            ls.append(s)
        s = ','.join(ls)
        return s

    def _dict2string(self, d):
        ls = []
        for k, v in d:
            s = ''
            if type(v) == bool:
                val = str(v).lower()
            elif isinstance(v, str):
                val = '\'' + v + '\''
            else:
                val = str(v)
            s += k + ':' + val
            ls.append(s)
        s = ','.join(ls)
        return s

    def set_view(self, B, L, zoom):
        htm = '''<script type="text/javascript">Jupytepide.map_setView([%f,%f],%f);</script>''' % (B, L, zoom)
        display(HTML(htm))

    def add_raster_layer(self):  # TODO: dorobic rastra
        pass

    def add_json_layer(self, geojson, name):

        if isinstance(geojson, dict):
            j = json.dumps(geojson)
        else:
            j = geojson

        htm = '''<script type="text/javascript">Jupytepide.map_addGeoJsonLayer(%s,"%s");</script>''' % (j, name)
        display(HTML(htm))

    def add_circle(self, x, y, r, popup='', params=-1):
        if params == -1:
            params = self.params
        htm = '''<script type="text/javascript">Jupytepide.map_addCircle([%f,%f],%f,%s,{%s});</script>''' % (
            x, y, r, popup, params)
        display(HTML(htm))

    def add_marker(self, x, y, popup='{title:\'Marker\', text:\'Marker\'}'):
        htm = '''<script type="text/javascript">Jupytepide.map_addMarker([%f,%f],%s);</script>''' % (x, y, popup)
        display(HTML(htm))

    def add_polygon(self, x, y, popup=''):
        """
        :param x: list of x
        :param y: list of y
        :param popup: popup message
        :return:
        """
        s = '['
        lista = []
        lx = zip(x, y)
        for i in lx:
            lista.append('[%f,%f]' % (i[0], i[1]))
        s += ",".join(lista)
        s += ']'
        htm = '''<script type="text/javascript">Jupytepide.map_polygon(%s,%s);</script>''' % (s, popup)
        display(HTML(htm))

    def add_polygon(self, tupleXY, popup):
        """
        :param tupleXY: list of tuples (x,y)
        :param popup: popup message
        :return:
        """
        s = '['
        t_list = []
        for i in tupleXY:
            t_list.append('[%f,%f]' % (i[0], i[1]))
        s += ",".join(t_list)
        s += ']'
        htm = '''<script type="text/javascript">Jupytepide.map_polygon(%s,%s);</script>''' % (s, popup)
        display(HTML(htm))

    def add_wms_layer(self, url, name, attrib=-1):
        if attrib == -1:
            attrib = self._attrib2string()
        elif isinstance(attrib, str):
            pass
        else:
            attrib = self._dict2string(attrib)

        htm = '''<script type="text/javascript">Jupytepide.map_addWmsLayer(%s,{%s},"%s");</script>''' % (
            url, attrib, name)
        display(HTML(htm))

    def add_tile_layer(self, url, name, attrib=-1):
        if attrib == -1:
            attrib = self._attrib2string()
        elif isinstance(attrib, str):
            pass
        else:
            attrib = self._dict2string(attrib)
        htm = '''<script type="text/javascript">Jupytepide.map_addTileLayer('%s',{%s},"%s");</script>''' % (
            url, attrib, name)
        display(HTML(htm))


class WMSLayer:
    htm = ''
    wms_attr = {
        'layers': '',
        'styles': '',
        'format': 'image/png',
        'transparent': True,
        'version': '1.1.1',
        'crs': 'null',
        'uppercase': False
    }
    name = ''
    url = ''
    requestParameters = ''

    def attributes2string(self):
        res = ''
        for k, v in self.wms_attr.items():
            res += k + ":'" + v + "',"
        return res[:-1]

    def add_wms_layer(self, url, name, attrib=-1):
        if attrib != -1:
            self.wms_attr = attrib
        self.name = name
        self.url = url

    def show_layer(self):
        self.htm = '''<script type="text/javascript">Jupytepide.map_addWmsLayer("%s",{%s},"%s");</script>''' % (
            self.url, self.attributes2string(), self.name)
        display(HTML(self.htm))

    def remove_layer(self):
        htm = '''<script type = "text/javascript"> Jupytepide.map_removeLayer("%s"); < / script > ''' % self.name
        display(HTML(htm))

    def change_attributes(self, name, value):
        self.wms_attr[name] = value


class ImageLayer():
    htm = ''
    attr = {'opacity': '0.8'}
    name = ''
    url = ''
    bounds = ''

    def __init__(self):
        if not os.path.exists("thumbnailtmp"):
            os.makedirs("thumbnailtmp")

    def thumbnail(self, product):
        # TODO: add support for other missions and products
        if os.path.isfile(product):
            product = os.path.dirname(product)
        files = [f for f in os.listdir(product) if os.path.isfile(os.path.join(product, f))]
        bbox = None
        if 'Envisat' in product:
            return -1
        elif 'Landsat-5' in product:
            for f in files:
                if f.lower().endswith('jpg'):
                    thumbnail = f
                if f.lower().endswith('bp.xml'):
                    with open(os.path.join(product, f), 'r') as xml:
                        g = xml.readlines()
                        for i in g:
                            if 'rep:coordList' in i:
                                m = re.findall(r'(?<=<rep:coordList>).*?(?=</rep:coordList>)', i, re.I)
                                if not m:
                                    return -1
                                else:
                                    bbox = [float(xx) for xx in m[0].split()]
        thumbnail = os.path.join(product, thumbnail)
        copyfile(thumbnail, "thumbnailtmp/thumb.jpg")
        bbox = '''[[%f,%f],[%f,%f]]''' % (bbox[0], bbox[3], bbox[2], bbox[1])
        print(bbox)
        self.add_image_layer("thumbnailtmp/thumb.jpg", bbox, "thumb")
        self.show_layer()

    def get_bbox(self, product):
        env_prd = product
        if os.path.isfile(product):
            product = os.path.dirname(product)
        files = [f for f in os.listdir(product) if os.path.isfile(os.path.join(product, f))]
        bbox = None
        if 'Envisat' in product:
            product = env_prd
            import snappy
            try:
                prod = snappy.ProductIO.readProduct(product)
                print(prod)
            except IOError:
                print("Error opening file....")
                return 0
            md = prod.getMetadataRoot()
            corners = {}
            for i in md.getElements():
                if i.getName() == "SPH":
                    attrib = i.getAttributes()
                    for j in attrib:
                        if (j.getName() in ["FIRST_FIRST_LAT", "FIRST_FIRST_LONG", "FIRST_MID_LAT", "FIRST_MID_LONG",
                                            "FIRST_LAST_LAT", "FIRST_LAST_LONG", "LAST_FIRST_LAT", "LAST_FIRST_LONG",
                                            "LAST_MID_LAT", "LAST_MID_LONG", "LAST_LAST_LAT", "LAST_LAST_LONG"]):
                            corners[j.getName()] = str(j.getData())
            lats = {x: float(corners[x]) * 1e-6 for x in corners if "LAT" in x}
            lons = {x: float(corners[x]) * 1e-6 for x in corners if "LONG" in x}
            print(max(lats.values()))
            bbox = '''[[%f,%f],[%f,%f]]''' % (
                max(lats.values()), min(lons.values()), min(lats.values()), max(lons.values()))
            return bbox
        elif 'Landsat-5' in product or 'Landsat-7' in product:
            for f in files:
                if f.lower().endswith('bp.xml'):
                    with open(os.path.join(product, f), 'r') as xml:
                        g = xml.readlines()
                        for i in g:
                            if 'rep:coordList' in i:
                                m = re.findall(r'(?<=<rep:coordList>).*?(?=</rep:coordList>)', i, re.I)
                                if not m:
                                    return -1
                                else:
                                    bbox = [float(xx) for xx in m[0].split()]
                        bbox = '''[[%f,%f],[%f,%f]]''' % (bbox[0], bbox[3], bbox[2], bbox[1])
        elif 'Landsat-8' in product:
            for f in files:
                if f.lower().endswith('mtl.txt'):
                    with open(os.path.join(product, f), 'r') as txt:
                        g = txt.readlines()
                    bbox = [None, None, None, None]
                    for i in g:
                        if 'CORNER_UL_LAT_PRODUCT' in i:
                            bbox[0] = float(i.split('=')[-1].strip())
                        if 'CORNER_UL_LON_PRODUCT' in i:
                            bbox[1] = float(i.split('=')[-1].strip())
                        if 'CORNER_LR_LAT_PRODUCT' in i:
                            bbox[2] = float(i.split('=')[-1].strip())
                        if 'CORNER_LR_LON_PRODUCT' in i:
                            bbox[3] = float(i.split('=')[-1].strip())
                            print(bbox)
                    bbox = '''[[%f,%f],[%f,%f]]''' % (bbox[2], bbox[3], bbox[0], bbox[1])
        elif 'Sentinel-1' in product:
            with open(os.path.join(product, 'manifest.safe')) as f:
                g = f.readlines()
            for i in g:
                bbox = [None, None, None, None]
                if 'coordinates' in i:
                    print(i)
                    m = re.findall(r'(?<=>).*?(?=<)', i, re.I)
                    corners = m[0].split()
                    corners = [(float(x.split(',')[0]), float(x.split(',')[1])) for x in corners]
                    lat = [x[0] for x in corners]
                    lon = [x[1] for x in corners]
                    bbox[0] = min(lat)
                    bbox[1] = max(lon)
                    bbox[2] = max(lat)
                    bbox[3] = min(lon)
                    bbox = '''[[%f,%f],[%f,%f]]''' % (bbox[0], bbox[1], bbox[2], bbox[3])
                    break
        elif 'Sentinel-2' in product:
            with open(os.path.join(product, 'manifest.safe')) as f:
                g = f.readlines()
            for i in g:
                bbox = [None, None, None, None]
                if 'coordinates' in i:
                    m = re.findall(r'(?<=coordinates>).*?(?=</gml:)', i, re.I)
                    corners = m[0].split()
                    lat = corners[::2]
                    lon = corners[1::2]
                    lon = [float(x) for x in lon]
                    lat = [float(x) for x in lat]
                    bbox[0] = min(lat)
                    bbox[1] = max(lon)
                    bbox[2] = max(lat)
                    bbox[3] = min(lon)
                    bbox = '''[[%f,%f],[%f,%f]]''' % (bbox[0], bbox[1], bbox[2], bbox[3])
                    break
        elif 'Sentinel-3' in product:
            with open(os.path.join(product, 'xfdumanifest.xml')) as f:
                g = f.readlines()
            for i in g:
                bbox = [None, None, None, None]
                if 'posList' in i:
                    m = re.findall(r'(?<=posList>).*?(?=</gml:)', i, re.I)
                    corners = m[0].split()
                    lat = corners[::2]
                    lon = corners[1::2]
                    lon = [float(x) for x in lon]
                    lat = [float(x) for x in lat]
                    bbox[0] = min(lat)
                    bbox[1] = max(lon)
                    bbox[2] = max(lat)
                    bbox[3] = min(lon)
                    bbox = '''[[%f,%f],[%f,%f]]''' % (bbox[0], bbox[1], bbox[2], bbox[3])
                    break
        return bbox

    def attributes2string(self):
        res = ''
        for k, v in self.attr.items():
            res += k + ":'" + v + "',"
        return res[:-1]

    def add_image_layer(self, url, bounds, name, attrib=-1):
        if attrib != -1:
            self.wmsAttribs = attrib
        self.name = name
        self.url = url
        self.bounds = bounds

    def show_layer(self):
        self.htm = '''<script type="text/javascript">Jupytepide.map_addImageLayer("%s",%s,'%s',{%s});</script>''' \
                   % (self.url, self.bounds, self.name, self.attributes2string())
        print(self.htm)
        display(HTML(self.htm))

    def remove_layer(self):
        htm = '''<script type="text/javascript">Jupytepide.map_removeLayer("%s");</script>''' % self.name
        display(HTML(htm))

    def change_attributes(self, name, value):
        self.attr[name] = value

