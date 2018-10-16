from flask import Flask
from flask import make_response
from flask import request
import mapnik
import os

os.chdir('/var/www/mydomain/')
app = Flask(__name__)


def rgb_style():
    rgb_symb = mapnik.RasterSymbolizer()
    rgb_rule = mapnik.Rule()
    rgb_rule.symbols.append(rgb_symb)
    rgb_style = mapnik.Style()
    rgb_style.rules.append(rgb_rule)
    return rgb_style
    
def two_collor_style(min_val, max_val, nodata_val, color1, color2):
    mono_symb = mapnik.RasterSymbolizer()
    mono_colorizer = mapnik.RasterColorizer()
    mono_colorizer.add_stop(min_val, mapnik.Color(color1))
    mono_colorizer.add_stop(max_val, mapnik.Color(color2))
    mono_colorizer.add_stop(nodata_val, mapnik.Color("transparent"))
    mono_symb.colorizer = mono_colorizer
    mono_rule = mapnik.Rule()
    mono_rule.symbols.append(mono_symb)
    mono_style = mapnik.Style()
    mono_style.rules.append(mono_rule)
    return mono_style

def three_collor_style(min_val, max_val, nodata_val, color1, color2, colo3):
    mono_symb = mapnik.RasterSymbolizer()
    mono_colorizer = mapnik.RasterColorizer()
    mono_colorizer.add_stop(min_val, mapnik.Color(color1))
    mono_colorizer.add_stop(int((max_val-min_val)/2.), mapnik.Color(color2))
    mono_colorizer.add_stop(max_val, mapnik.Color(color3))
    mono_colorizer.add_stop(nodata_val, mapnik.Color("transparent"))
    mono_symb.colorizer = mono_colorizer
    mono_rule = mapnik.Rule()
    mono_rule.symbols.append(mono_symb)
    mono_style = mapnik.Style()
    mono_style.rules.append(mono_rule)
    return mono_style


def red_blue_style(min_val, max_val, nodata_val):
    return two_collor_style(min_val, max_val, nodata_val, 'red', 'blue')

def blue_red_style(min_val, max_val, nodata_val):
    return two_collor_style(min_val, max_val, nodata_val, 'blue', 'red')
    
def green_yellow_red_style():
    return three_collor_style(min_val, max_val, nodata_val, 'green', 'yellow', 'red')


RGB_STYLE = rgb_style()

@app.route('/')
def get_map():

    if 'BBOX' in request.args:
        req_bbox = request.args.get('BBOX')   
    elif 'bbox' in request.args:
        req_bbox = request.args.get('bbox')
    else:
        return "bbox is required"
        
    if 'WIDTH' in request.args:
        req_width = request.args.get('WIDTH')
    elif 'width' in request.args:
        req_width = request.args.get('width')
    else:
        return "width is required"
        
    if 'HEIGHT' in request.args:
        req_height = request.args.get('HEIGHT')
    elif 'height' in request.args:
        req_height = request.args.get('height')
    else:
        return "height is required"
        
    if 'PATH' in request.args:
        req_path = request.args.get('PATH')
    elif 'path' in request.args:
        req_path = request.args.get('path')
    else:
        return "path is required"
        
    if 'STYLE' in request.args:
        req_style = request.args.get('STYLE')
    elif 'style' in request.args:
        req_style = request.args.get('style')
    else:
        return "style is required"
        
    if 'DELTA' in request.args:
        req_delta = request.args.get('DELTA')
    elif 'delta' in request.args:
        req_delta = request.args.get('delta')
    else:
        return "delta is required. Delta is a param wich shows \
        picture minimum and maximum value. Example -100|5990"

    if 'NODATA' in request.args:
        req_nodata = request.args.get('NODATA')
    elif 'nodata' in request.args:
        req_nodata = request.args.get('nodata')
    else:
        return "nodata is required."

        

    ret_map = mapnik.Map(int(req_width), int(req_height))
    im = mapnik.Image(int(req_width), int(req_height))
    layer = mapnik.Layer("requested_lyr")
    layer.styles.append("requested_lyr")

    if req_style.lower() == "rgb":
        layer.datasource = mapnik.Gdal(file=req_path)
        ret_map.append_style("requested_lyr", RGB_STYLE)
        ret_map.layers.append(layer)
        
    elif req_style.lower() == "rb":
        layer.datasource = mapnik.Gdal(file=req_path, band=1)
        minval, maxval = [int(x) for x in req_delta.split('|')]
        ret_map.append_style("requested_lyr", red_blue_style(minval, maxval, int(req_nodata)))
        ret_map.layers.append(layer)
        
    else:
        return "syle error"

    bbox = (float(i) for i in req_bbox.split(","))
    bbox = mapnik.Box2d(next(bbox),next(bbox),next(bbox),next(bbox))
    ret_map.zoom_to_box(bbox)

    mapnik.render(ret_map, im)

    response = make_response(im.tostring('png'))
    response.headers.set('Content-Type', 'image/png')
    return response
