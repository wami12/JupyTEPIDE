import requests

from sdk.maps.geoserver.json_builder import get_json_workspace


def _url(params):
    return 'http://localhost:8090/geoserver/rest/imports' + params


def get_tasks():
    return requests.get(_url('/tasks/'))


def post_task():
    url = _url("")
    json_ws = get_json_workspace("sf")
    headers = {
        'Content-type': 'application/json',
    }
    req = requests.post(url, headers=headers, data=json_ws, auth=('admin', 'geoserver'))
    return req


def post_tiff():
    url = _url("/11/tasks")
    # req = requests.post(url, auth=('admin', 'geoserver'), files= (('name', 'test'), ('filedata', '@test_snappy.tif')))
    req = requests.post(url, auth=('admin', 'geoserver'), files=dict(foo='bar', filedata='test_snappy.tif'))

    return req


def describe_task(task_id):
    return requests.get(_url('/tasks/{:d}/'.format(task_id)))


def add_task(summary, description=""):
    return requests.post(_url('/tasks/'), json={
        'summary': summary,
        'description': description,
    })


def task_done(task_id):
    return requests.delete(_url('/tasks/{:d}/'.format(task_id)))


def update_task(task_id, summary, description):
    url = _url('/tasks/{:d}/'.format(task_id))
    return requests.put(url, json={
        'summary': summary,
        'description': description,
    })
