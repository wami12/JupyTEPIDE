This repo contains map service witch allows to publish geotiff images via https.
Javascript frameworks like openlayers or leaflet, can communicate with this solution to get images which can be presented on the dynamic map. 

The solution used modified WMS protocol(GetMap only). Needed request arguments are:
1. BBOX - should be in the same coordinate system as datasource
2. WIDTH - width in pixels of destination image
3. HEIGHT - height in pixels of destination image
4. PATH - path to tif data source, available for www-data user on docker maschine (it was planed to store ds on external docker volume)

Repo contains also html tester, simple html file which allows to check if service is working. 

This software can have bugs, work unexpected or randomly :)