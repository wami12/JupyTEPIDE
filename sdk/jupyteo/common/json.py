import json
import uuid
from urllib.request import *

import pandas as pd
from IPython.display import display_javascript, display_html


class RenderJSON(object):
    def __init__(self, json_data):
        if isinstance(json_data, dict) or isinstance(json_data, list):
            self.json_str = json.dumps(json_data)
        else:
            self.json_str = json_data
        self.uuid = str(uuid.uuid4())

    def _ipython_display_(self):
        display_html(
            '<div id="{}" style="height: 600px; width:100%;font: 12px/18px monospace !important;"></div>'.format(
                self.uuid), raw=True)
        display_javascript("""
        require(["https://rawgit.com/caldwell/renderjson/master/renderjson.js"], function() {
            renderjson.set_show_to_level(1);
            document.getElementById('%s').appendChild(renderjson(%s))
        });
      """ % (self.uuid, self.json_str), raw=True)


def render_as_tree(url_metadata):
    req = Request(url_metadata)
    opener = build_opener()
    f = opener.open(req)
    json_obj = json.loads(f.read())
    return RenderJSON(json_obj)


def render_as_table(url_metadata):
    pd_json = pd.read_json(url_metadata, orient='colums')
    return pd_json


def render_as_pure_json(url_metadata):
    req = Request(url_metadata)
    opener = build_opener()
    f = opener.open(req)
    json_obj = json.loads(f.read())
    pure_json = json.dumps(json_obj, indent=3, sort_keys=True)
    print(pure_json)
    return pure_json
