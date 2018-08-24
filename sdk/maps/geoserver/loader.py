import requests

from sdk.maps.geoserver.exceptions import ApiError
from sdk.maps.geoserver.rest import post_task, post_tiff

# resp = requests.get('https://todolist.example.com/tasks/')
resp = post_tiff()
print(resp)
if resp.status_code != 201:
    # This means something went wrong.
    raise ApiError('GET /tasks/ {}'.format(resp.status_code))

# resp2 = post_tiff()

