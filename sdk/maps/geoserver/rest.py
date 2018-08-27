import json
import subprocess

import requests

from sdk.maps.geoserver.exceptions import ApiError
from sdk.maps.geoserver.json_builder import get_json_workspace


def _url(params):
    return 'http://localhost:8090/geoserver/rest/imports' + params


def get_tasks():
    return requests.get(_url('/tasks/'))


def post_init_import():
    url = _url("")
    json_ws = get_json_workspace("demo")
    headers = {
        'Content-type': 'application/json',
    }
    resp = requests.post(url, headers=headers, data=json_ws, auth=('admin', 'geoserver'))
    if resp.status_code != 201:
        # This means something went wrong.
        raise ApiError('GET /tasks/ {} - {}'.format(resp.status_code, resp.content))
    return resp


def read_resp_json(response):
    json_str = response.content
    json_obj = json.loads(json_str)
    print(json_obj)
    return json_obj


def get_import_id(response):
    obj = read_resp_json(response)
    import_id = obj['import']['id']
    return import_id


def post_tiff(import_id):
    import_param = "/%s/tasks" % import_id
    url = _url(import_param)
    # req = requests.post(url, auth=('admin', 'geoserver'), files= (('name', 'test'), ('filedata', '@test_snappy.tif')))
    req = requests.post(url, auth=('admin', 'geoserver'), files=dict(name='test', filedata='@test_snappy.tif'))

    return req


def post_tiff_curl(import_id, filename):
    import_param = "/%s/tasks" % import_id
    url_str = str(_url(import_param))
    file_header = "filedata=@%s" % filename
    res = subprocess.call([
        "curl", "-u", "admin:geoserver", "-F", "name=test", "-F", file_header, url_str], shell=False)
    return res


def post_import_final_curl(import_id):
    import_param = "/%s" % import_id
    url = _url(import_param)
    res = subprocess.call([
        "curl", "-u", "admin:geoserver", "-XPOST", url
    ], shell=False)
    return res


def post_import_final(import_id):
    import_param = "/%s" % import_id
    url = _url(import_param)
    resp = requests.post(url, auth=('admin', 'geoserver'))
    if resp.status_code != 204:
        # This means something went wrong.
        raise ApiError('GET /tasks/ {}'.format(resp.status_code))
    return resp
