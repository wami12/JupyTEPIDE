import os

import mapnik
from flask import Flask
from flask import make_response
from flask import request

os.chdir('/var/www/mydomain/')
app = Flask(__name__)


def rgb_style():
    rgb_symb = mapnik.RasterSymbolizer()
    rgb_rule = mapnik.Rule()
    rgb_rule.symbols.append(rgb_symb)
    rgb_style = mapnik.Style()
    rgb_style.rules.append(rgb_rule)
    return rgb_style


RGB_STYLE = rgb_style()


@app.route('/')
def get_map():
    if 'BBOX' in request.args:
        req_bbox = request.args.get('BBOX')
    else:
        return "BBOX is required"
    if 'WIDTH' in request.args:
        req_width = request.args.get('WIDTH')
    else:
        return "WIDTH is required"
    if 'HEIGHT' in request.args:
        req_height = request.args.get('HEIGHT')
    else:
        return "HEIGHT is required"
    if 'PATH' in request.args:
        req_path = request.args.get('PATH')
    else:
        return "PATH is required"

    ret_map = mapnik.Map(int(req_width), int(req_height))
    im = mapnik.Image(int(req_width), int(req_height))
    layer = mapnik.Layer("requested_lyr")
    layer.styles.append("requested_lyr")

    layer.datasource = mapnik.Gdal(file=req_path)

    ret_map.append_style("requested_lyr", RGB_STYLE)
    ret_map.layers.append(layer)

    bbox = (float(i) for i in req_bbox.split(","))
    bbox = mapnik.Box2d(next(bbox), next(bbox), next(bbox), next(bbox))
    ret_map.zoom_to_box(bbox)

    mapnik.render(ret_map, im)

    response = make_response(im.tostring('png'))
    response.headers.set('Content-Type', 'image/png')
    return response
