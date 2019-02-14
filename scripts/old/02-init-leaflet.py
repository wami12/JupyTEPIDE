import json
import os
import re
from IPython.display import HTML, display
from shutil import copyfile


class Leaflet():
    wmsAttribs = {
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
        for k, v in self.wmsAttribs.items():
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

    def setView(self, B, L, zoom):
        htm = '''<script type="text/javascript">Jupytepide.map_setView([%f,%f],%f);</script>''' % (B, L, zoom)
        display(HTML(htm))

    def addRasterLayer(self):  # TODO: dorobic rastra
        pass

    def addJsonLayer(self, geojson, name):

        if isinstance(geojson, dict):
            j = json.dumps(geojson)
        else:
            j = geojson

        htm = '''<script type="text/javascript">Jupytepide.map_addGeoJsonLayer(%s,"%s");</script>''' % (j, name)
        display(HTML(htm))

    def addCircle(self, x, y, r, popup='', params=-1):
        if params == -1:
            params = self.params
        htm = '''<script type="text/javascript">Jupytepide.map_addCircle([%f,%f],%f,%s,{%s});</script>''' % (
            x, y, r, popup, params)
        display(HTML(htm))

    def addMarker(self, x, y, popup='{title:\'Marker\', text:\'Marker\'}'):
        htm = '''<script type="text/javascript">Jupytepide.map_addMarker([%f,%f],%s);</script>''' % (x, y, popup)
        display(HTML(htm))

    def addPolygon(self, x, y, popup=''):
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

    def addPolygon(self, tupleXY, popup):
        """
        :param tupleXY: list of tuples (x,y)
        :param popup: popup message
        :return:
        """
        s = '['
        lista = []
        for i in tupleXY:
            lista.append('[%f,%f]' % (i[0], i[1]))
        s += ",".join(lista)
        s += ']'
        htm = '''<script type="text/javascript">Jupytepide.map_polygon(%s,%s);</script>''' % (s, popup)
        display(HTML(htm))

    def addWmsLayer(self, url, name, attrib=-1):
        if attrib == -1:
            attrib = self._attrib2string()
        elif isinstance(attrib, str):
            pass
        else:
            attrib = self._dict2string(attrib)

        htm = '''<script type="text/javascript">Jupytepide.map_addWmsLayer(%s,{%s},"%s");</script>''' % (
            url, attrib, name)
        display(HTML(htm))

    def addTileLayer(self, url, name, attrib=-1):
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
    wmsAttribs = {
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

    def attributesTostring(self):
        wynik = ''
        for k, v in self.wmsAttribs.items():
            wynik += k + ":'" + v + "',"
        return (wynik[:-1])

    def addWmsLayer(self, url, name, attrib=-1):
        if attrib != -1:
            self.wmsAttribs = attrib
        self.name = name
        self.url = url

    def showLayer(self):
        self.htm = '''<script type="text/javascript">Jupytepide.map_addWmsLayer("%s",{%s},"%s");</script>''' % (
            self.url, self.attributesTostring(), self.name)
        display(HTML(self.htm))

    def removeLayer(self):
        htm = '''<script type = "text/javascript"> Jupytepide.map_removeLayer("%s"); < / script > ''' % self.name
        display(HTML(htm))

    def changeAttributes(self, name, value):
        self.wmsAttribs[name] = value


class ImageLayer():
    htm = ''
    attribs = {'opacity': '0.8'}
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
        self.addImageLayer("thumbnailtmp/thumb.jpg", bbox, "thumb")
        self.showLayer()

    def getbb(self, product):
        envprd = product
        if os.path.isfile(product):
            product = os.path.dirname(product)
        files = [f for f in os.listdir(product) if os.path.isfile(os.path.join(product, f))]
        bbox = None
        if 'Envisat' in product:
            product = envprd
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
                if (i.getName() == "SPH"):
                    atrybuty = i.getAttributes()
                    for j in atrybuty:
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
                if ('coordinates') in i:
                    print(i)
                    m = re.findall(r'(?<=>).*?(?=<)', i, re.I)
                    narozniki = m[0].split()
                    narozniki = [(float(x.split(',')[0]), float(x.split(',')[1])) for x in narozniki]
                    lat = [x[0] for x in narozniki]
                    lon = [x[1] for x in narozniki]
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
                if ('coordinates') in i:
                    m = re.findall(r'(?<=coordinates>).*?(?=</gml:)', i, re.I)
                    narozniki = m[0].split()
                    lat = narozniki[::2]
                    lon = narozniki[1::2]
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
                if ('posList') in i:
                    m = re.findall(r'(?<=posList>).*?(?=</gml:)', i, re.I)
                    narozniki = m[0].split()
                    lat = narozniki[::2]
                    lon = narozniki[1::2]
                    lon = [float(x) for x in lon]
                    lat = [float(x) for x in lat]
                    bbox[0] = min(lat)
                    bbox[1] = max(lon)
                    bbox[2] = max(lat)
                    bbox[3] = min(lon)
                    bbox = '''[[%f,%f],[%f,%f]]''' % (bbox[0], bbox[1], bbox[2], bbox[3])
                    break
        return bbox

    def attributesTostring(self):
        wynik = ''
        for k, v in self.attribs.items():
            wynik += k + ":'" + v + "',"
        return (wynik[:-1])

    def addImageLayer(self, url, bounds, name, attrib=-1):
        if (attrib != -1):
            self.wmsAttribs = attrib
        self.name = name
        self.url = url
        self.bounds = bounds

    def showLayer(self):
        self.htm = '''<script type="text/javascript">Jupytepide.map_addImageLayer("%s",%s,'%s',{%s});</script>''' \
                   % (self.url, self.bounds, self.name, self.attributesTostring())
        display(HTML(self.htm))

    def removeLayer(self):
        htm = '''<script type="text/javascript">Jupytepide.map_removeLayer("%s");</script>''' % self.name
        display(HTML(htm))

    def changeAttributes(self, name, value):
        self.attribs[name] = value


def Main():
    ll = Leaflet()
    geojsonFeature = {
        "type": "Feature",
        "geometry": {
            "type": "Polygon",
            "coordinates": [
                [[17.06101, 51.1093], [17.06691, 51.10739], [17.06581, 51.10691]]
            ]
        },
        "properties": {
            "description": "value0",
            "prop1": {"this": "that"}
        }
    }


if __name__ == '__main__':
    Main()

print("Added script 02-init-leaflet.py")