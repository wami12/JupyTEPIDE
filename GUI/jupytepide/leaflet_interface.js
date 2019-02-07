// File jupytepide/leaflet_interface.js
// Edited by: Michał Bednarczyk
// Copyright (C) 2017-2019 .....
//
//  Distributed under the terms of the BSD License.
// ---------------------------------------------------------------------------
// Interface for leaflet.js map component library

define([
    'base/js/namespace',
    'jquery',
    'require',
    './code_snippets',
    './leaflet',
    'base/js/utils'

], function (Jupyter,
             $,
             require,
             code_snippets,
             L,
             utils
) {

    //Adding this method to String.prototype to implement string formatting
    // (I could use template strings of course, but this I'm more sure of)
    String.prototype.format = function() {
        var formatted = this;
        for (var i = 0; i < arguments.length; i++) {
            var regexp = new RegExp('\\{'+i+'\\}', 'gi');
            formatted = formatted.replace(regexp, arguments[i]);
        }
        return formatted;
    };

    var mymap;

    //*** load_map ***
    //Used for initial map loading (not for notebook users)
    //Jupytepide.leafletMap initialization
    var load_map = function(map_container) {
        mymap = L.map(map_container,{drawControl:true});
        Jupytepide.leafletMap = mymap;
        toggle_map_action('mapClick');
        Jupytepide.marker = new L.Marker();
        Jupytepide.leafletMap.tmpShapeID = -1;
        Jupytepide.leafletMap.tmpShapeVertexArray = [];
        Jupytepide.leafletMap.tmpShapeWKT = 'undefined';

        Jupytepide.leafletMap.setView([0,0], 1).on('click', onMapClick);
        L.control.scale().addTo(Jupytepide.leafletMap);

        //this enables all tools from leaflet.pm plugin - can be used in near future
        //todo:leaflet pm controls adding
        //Jupytepide.leafletMap.pm.addControls();

        //events for edit temporary shapes controling
        // (shapes for searching and temp shapes for drawing - deleted after search or after entering the shape onto the layer)
        //Remember tmpShapeID
        Jupytepide.leafletMap.on('pm:create', function(e) {
            e.shape; // the name of the shape being drawn (i.e. 'Circle')
            //console.log(e.layer._leaflet_id); // the leaflet layer created
            var tmpShapeID = e.layer._leaflet_id;
            Jupytepide.leafletMap.tmpShapeID = tmpShapeID;

        });

        //remember each vertex in tmpShapeVertexArray
        Jupytepide.leafletMap.on('pm:drawstart', function(e) {
            var layer = e.workingLayer;
            Jupytepide.leafletMap.tmpShapeVertexArray = [];
            if (Jupytepide.marker) {
                Jupytepide.marker.remove()
            }
            remove_tmp_shape();
            //console.log(e.latlng);
            toggle_map_action('mapAddPoly');


            layer.on('pm:vertexadded', function(e) {
                //console.log(e.latlng);
                if (e.shape=='Poly') {
                    Jupytepide.leafletMap.tmpShapeVertexArray.push(e.latlng);
                }
            });

            if (e.shape=='Rectangle'){
                Jupytepide.leafletMap.tmpShapeVertexArray=[];
                toggle_map_action('mapAddRectangle');
            }
        });

        //remember WKT of entered shape (to create RESTO data query)
        Jupytepide.leafletMap.on('pm:drawend',function(e){
            if (e.shape=='Poly'|e.shape=='Rectangle'){
                toggle_map_action('mapClick');

                if (e.shape=='Rectangle' & typeof Jupytepide.leafletMap.tmpShapeVertexArray != 'undefined'
                    & Jupytepide.leafletMap.tmpShapeVertexArray.length>0 ){
                    //must build rectangle for WKT from two collected points
                    var tmpVtxArr = Jupytepide.leafletMap.tmpShapeVertexArray;
                    if (tmpVtxArr[0].lat>tmpVtxArr[1].lat & tmpVtxArr[0].lng<tmpVtxArr[1].lng){
                        tmpVtxArr.splice(1,0,{lat:tmpVtxArr[0].lat, lng:tmpVtxArr[1].lng});
                        tmpVtxArr.push({lat:tmpVtxArr[2].lat, lng:tmpVtxArr[0].lng})
                    }

                    if (tmpVtxArr[0].lat<tmpVtxArr[1].lat & tmpVtxArr[0].lng<tmpVtxArr[1].lng){
                        tmpVtxArr.splice(1,0,{lat:tmpVtxArr[1].lat, lng:tmpVtxArr[0].lng});
                        tmpVtxArr.push({lat:tmpVtxArr[0].lat, lng:tmpVtxArr[2].lng})
                    }

                    if (tmpVtxArr[0].lat<tmpVtxArr[1].lat & tmpVtxArr[0].lng>tmpVtxArr[1].lng){
                        tmpVtxArr.splice(1,0,{lat:tmpVtxArr[0].lat, lng:tmpVtxArr[1].lng});
                        tmpVtxArr.push({lat:tmpVtxArr[2].lat, lng:tmpVtxArr[0].lng})
                    }

                    if (tmpVtxArr[0].lat>tmpVtxArr[1].lat & tmpVtxArr[0].lng>tmpVtxArr[1].lng){
                        tmpVtxArr.splice(1,0,{lat:tmpVtxArr[1].lat, lng:tmpVtxArr[0].lng});
                        tmpVtxArr.push({lat:tmpVtxArr[0].lat, lng:tmpVtxArr[2].lng})
                    }

                    Jupytepide.leafletMap.tmpShapeVertexArray=tmpVtxArr;

                }

                var WKTstr = 'POLYGON((';
                var vertexStr='';
                var numVertex = Jupytepide.leafletMap.tmpShapeVertexArray.length;
                 for(var i=0;i<numVertex;i++){
                     vertexStr = Jupytepide.leafletMap.tmpShapeVertexArray[i].lng +' '+ Jupytepide.leafletMap.tmpShapeVertexArray[i].lat;

                     if(i==numVertex-1){
                         WKTstr=WKTstr+ vertexStr+','+Jupytepide.leafletMap.tmpShapeVertexArray[0].lng +' '+ Jupytepide.leafletMap.tmpShapeVertexArray[0].lat+'))';
                     }
                     else WKTstr=WKTstr+ vertexStr+',';
                 }
             }
             Jupytepide.leafletMap.tmpShapeWKT = WKTstr;
            $('#insertSearchShapeButton').removeClass('selected');
        });
    };

    var map_invalidateSize = function(){
        mymap.invalidateSize();
    };

    //*** load_layer ***
    //call example - look at load_mapboxLayer
    //example:  url_='https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw'
    //          atrib_={maxZoom:18, attribution:'copyrights etc...',id:'mapbox.streets'}
    var load_tileLayer = function(url_,atrib) {
        return L.tileLayer(url_, atrib).addTo(Jupytepide.leafletMap);
    };

    //*** load_wmsLayer ***
    //example: url='https://demo.boundlessgeo.com/geoserver/ows?', atrib={layers:'ne:ne'}, more options: http://leafletjs.com/reference-1.3.0.html#tilelayer-wms
    var load_wmsLayer = function (url_,atrib){
        return L.tileLayer.wms(url_,atrib).addTo(Jupytepide.leafletMap);

    };

    //*** load_geoJsonLayer ***
    var load_geoJsonLayer = function(data,options){
        return L.geoJSON(data,options
        ).addTo(Jupytepide.leafletMap);
    };

    //*** getRestoGeoJSON ***
    var getRestoGeoJSON = function(url_){
        var returnedJSON={};
        $.get(url_, function (data) {
                 returnedJSON=data;
        });
        $('#restoSearchBtnIcon').hide();
        return returnedJSON;
    };

    //*** load_imageLayer ***
    //example: imageUrl = '/nbextensions/jupytepide/img/raster-1.jpg', imageBounds = [[40.712216, -74.22655], [40.773941, -74.12544]];
    var load_imageLayer = function(imageUrl,imageBounds,options){
        return L.imageOverlay(imageUrl,imageBounds,options).addTo(Jupytepide.leafletMap);

    };

    //*** load_mapboxLayer ***
    //initial map loaded into Jupytepide UI
    var load_mapboxLayer = function() {
        load_tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
            maxZoom: 18,
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
            '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="http://mapbox.com">Mapbox</a>',
            id: 'mapbox.streets'
        });

        set_view([52,21],3);
    };

    //*** load_initialBaseLayers ***
    var load_initialBaseLayers = function() {
        Jupytepide.leafletMap.layers = {};

        Jupytepide.leafletMap.layers.mapbox = load_tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
            maxZoom: 18,
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
            '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="http://mapbox.com">Mapbox</a>',
            id: 'mapbox.streets'
        });

        Jupytepide.leafletMap.layers.osm = load_tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 20,
            attribution: 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
        });

        //Base layers ****
        var baseLayers = {
            "Mapbox:streets":Jupytepide.leafletMap.layers.mapbox,
            "OSM":Jupytepide.leafletMap.layers.osm
        };

        var overlays ={};
        Jupytepide.leafletMap.control = add_layerControls(baseLayers,overlays);
        set_view([52,21],3);
    };

    //*** set_view ***
    var set_view = function(center,zoom){
        Jupytepide.leafletMap.setView(center, zoom);
    };

    // //*** layer_moveUp ***
    // var layer_moveUp = function(layer){
    //     layer.options.zIndex = layer.options.zIndex+1;
    // };
    //
    // //*** layer_moveDown ***
    // var layer_moveDown = function(layer){
    //     layer.options.zIndex = layer.options.zIndex-1;
    // };

    //
    //*** markerIcon ***
    var markerIcon = L.icon({
        iconUrl: utils.url_path_join(Jupyter.notebook.base_url,require.toUrl('/nbextensions/jupytepide/img/marker-icon.png')),
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [0, -41],
        shadowUrl: utils.url_path_join(Jupyter.notebook.base_url,require.toUrl('/nbextensions/jupytepide/img/marker-shadow.png')),
        shadowSize: [41, 41],
        shadowAnchor: [12, 41]
    });

    //*** add_marker ***
    //example: center=[51.11134, 17.0343], popup_={title: 'Wrocław',text:'Miasto w Polsce'}
    var add_marker = function(center,popup_) {
        var html_popup = "<b>{0}</b><br />{1}".format(popup_.title,popup_.text);
        var parameters={icon: markerIcon};
        L.marker(center, parameters).addTo(Jupytepide.leafletMap)
            .bindPopup(html_popup);
    };

    var popup = L.popup();

    function onMapClick(e) {
        //console.log(e.latlng.toString());
        //if no RESTO searching adding shapes - map is in "click" mode
        if (Jupytepide.mapClick){
            if(Jupytepide.marker){
                Jupytepide.marker.remove()}
            remove_tmp_shape();
            // popup
            //     .setLatLng(e.latlng)
            //     .setContent("You clicked the map at " + e.latlng.toString())
            //     .openOn(Jupytepide.leafletMap);
        }

        //point marker for RESTO searching - "click" mode disabled
        else if (Jupytepide.mapAddPoint){
            Jupytepide.marker = new L.Marker(e.latlng,{draggable:true,icon:markerIcon});
            Jupytepide.leafletMap.addLayer(Jupytepide.marker);
            Jupytepide.leafletMap.tmpShapeWKT='MULTIPOINT(('+Jupytepide.marker._latlng.lng+' '+Jupytepide.marker._latlng.lat+'))';
            toggle_map_action('mapClick');
            $('#insertSearchShapeButton').removeClass('selected');
        }

        //polygon shape for RESTO searching - "click" mode disabled - look at load_map()
        else if (Jupytepide.mapAddPoly){
            //this is manained by leaflet pm extension's events
        }

        //rectangle shape for RESTO searching - "click" mode disabled - look at load_map()
        else if (Jupytepide.mapAddRectangle){

            //collect (two) points to build rectangle shape (in WKT)
            Jupytepide.leafletMap.tmpShapeVertexArray.push(e.latlng)
        }
    }
    //*** toggle_map_action ***
    //set action, which takes place on the map at the moment
    var toggle_map_action = function(action){
        Jupytepide.mapAddPoint=false;
        Jupytepide.mapAddRectangle = false;
        Jupytepide.mapAddPoly = false;
        Jupytepide.mapClick=false;

        if (action=='mapAddPoint'){Jupytepide.mapAddPoint=true}
        else if (action=='mapAddRectangle'){Jupytepide.mapAddRectangle=true}
        else if (action=='mapAddPoly'){Jupytepide.mapAddPoly=true}
        else if (action=='mapClick'){Jupytepide.mapClick=true}
    };

    //*** remove_tmp_shape ***
    //removes from map, temporary shape drawn with leaflet pm extension (for RESTO searching)
    var remove_tmp_shape = function(){
        if(Jupytepide.leafletMap.tmpShapeWKT){
            if (Jupytepide.leafletMap._layers[Jupytepide.leafletMap.tmpShapeID]) {
                Jupytepide.leafletMap._layers[Jupytepide.leafletMap.tmpShapeID].remove()
            }
            //Jupytepide.leafletMap.pm.disableDraw();
            Jupytepide.leafletMap.tmpShapeID = -1;
            Jupytepide.leafletMap.tmpShapeVertexArray = [];
            Jupytepide.leafletMap.tmpShapeWKT = 'undefined';
        }
    };

    //temp shapes as markesr for RESTO searching (point,rectangle,polygon)
    //*** draw_point_tmp_marker ***
    var draw_point_tmp_marker = function(){
        if(Jupytepide.marker){Jupytepide.marker.remove()}
        remove_tmp_shape();
        Jupytepide.leafletMap.pm.disableDraw();
        toggle_map_action('mapAddPoint');

    };
    //*** draw_rect_tmp_marker ***
    var draw_rect_tmp_marker = function(options){
        Jupytepide.leafletMap.pm.enableDraw('Rectangle',options);
    };
    //*** draw_poly_tmp_marker ***
    var draw_poly_tmp_marker = function(options){
        Jupytepide.leafletMap.pm.enableDraw('Poly',options);
    };
    //end of temp shapes as markers for RESTO searching

    //*** add_circle ***
    //center=[52.407, 21.33], radius=500, popup_="Some text", parameters_={color: 'red', fillColor: '#f03', fillOpacity: 0.5}
    var add_circle = function(center,radius,popup_,parameters_){
        return L.circle(center, radius, parameters_).addTo(Jupytepide.leafletMap).bindPopup(popup_);
    };

    //*** add_polygon ***
    //points=[[51.1092, 17.06108],[51.10734, 17.06698],[51.10697, 17.06587]], popup="Some text", parameters_={color: 'red', fillColor: '#f03', fillOpacity: 0.5}
    var add_polygon = function(points,popup_,parameters_){
        return L.polygon(points,parameters_).addTo(Jupytepide.leafletMap).bindPopup(popup_);
    };

    //*** add_polyline ***
    //latlngs=[[17.06101,51.1093],[17.06691,51.10739],[17.06581,51.10691]], options={color:'red'}, popup='linijka'
    var add_polyline = function(latlngs,options,popup_){
        return L.polyline(latlngs,options).addTo(Jupytepide.leafletMap).bindPopup(popup_);
    };

    //*** add_layerControls ***
    var add_layerControls = function(baseLayers,overlays){
        return L.control.layers(baseLayers,overlays,{collapsed:true}).addTo(Jupytepide.leafletMap);

    };

    //*** add_controlBaseLayer ***
    //Add a base layer instance to control.layers (radio button entry)
    var add_controlBaseLayer = function(Layer,name){
        //L.control.addBaseLayer(Layer,name);
    };

    //*** add_controlBaseLayer ***
    //Add an overlay layer instance to control.layers (check box entry)
    var add_controlOverlayLayer = function(Layer,name){
        //L.control.addOverlay(Layer,name);
    };

    var remove_controlLayer = function(Layer){
        // L.control.removeLayer(Layer);
    };

    //****** testing area **********************************************************************************************

    //load IMAGE
    var load_image = function(){
        //ta funkcja działa z jpg, nie działa z geotiff
        //todo: można zrobić ładowanie geotiff na podobę: https://github.com/stuartmatthews/leaflet-geotiff
        //todo: albo pociąć na tilesy i czytać przez loadTile(): http://build-failed.blogspot.it/2012/11/zoomable-image-with-leaflet.html

        //nbextensions/jupytepide/img/marker-icon.png

        // var imageUrl = 'http://www.lib.utexas.edu/maps/historical/newark_nj_1922.jpg',
        //     imageBounds = [[40.712216, -74.22655], [40.773941, -74.12544]];

        var imageUrl = '/nbextensions/jupytepide/img/raster-1.jpg',
            imageBounds = [[51.712216, 17.22655], [51.773941, 17.12544]];

        L.imageOverlay(imageUrl,imageBounds,{opacity:0.5}).addTo(Jupytepide.leafletMap);
        set_view([51.712216, 17.22655],12);
    };

    //load JSON
    var load_geojson = function(){
        var geojsonFeature ={
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [ [51.1093, 17.06101],[51.10739, 17.06691],[51.10691, 17.06581] ]
                ]
            },
            "properties": {
                "description": "value0",
                "prop1": {"this": "that"}
            }
        };

        L.geoJSON(geojsonFeature).addTo(Jupytepide.leafletMap);
        set_view([17.06101,51.1093],16);
    };

    //*** load_leaflet ***
    //todo:function for testing purposes - delete when finished
    var load_leaflet = function () {
        mymap = L.map("map_container").setView([51.505, -0.09], 13);
        Jupytepide.leafletMap = mymap;

        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
            maxZoom: 18,
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
            '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="http://mapbox.com">Mapbox</a>',
            id: 'mapbox.streets'
        }).addTo(mymap);

        var myIcon = L.icon({
            iconUrl: require.toUrl('./img/marker-icon.png'),//'/nbextensions/jupytepide/img/marker-icon.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [0, -41],
            shadowUrl:require.toUrl('./img/marker-shadow.png'),// '/nbextensions/jupytepide/img/marker-shadow.png',
            shadowSize: [41, 41],
            shadowAnchor: [12, 41]
        });

        //leaflet.marker([51.5, -0.09],{icon: myIcon}).addTo(mymap)
        //    .bindPopup("<b>Hello world!</b><br />I am a popup.").openPopup();

        L.marker([51.5, -0.09], {icon: myIcon}).addTo(mymap)
            .bindPopup("<b>Hello world!</b><br />I am a popup.");

        L.circle([51.508, -0.11], 500, {
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.5
        }).addTo(mymap).bindPopup("I am a circle.");

        L.polygon([
            [51.509, -0.08],
            [51.503, -0.06],
            [51.51, -0.047]
        ]).addTo(mymap).bindPopup("I am a polygon.");


        var popup = L.popup();

        function onMapClick(e) {
            popup
                .setLatLng(e.latlng)
                .setContent("You clicked the map at " + e.latlng.toString())
                .openOn(mymap);
        }

        mymap.on('click', onMapClick);
    };

    var load_test_polygon = function(popupText){
        L.polygon([
            [51.51863, -0.18488],
            [51.50165, -0.2029],
            [51.49577, -0.15003]
        ]).addTo(Jupytepide.leafletMap).bindPopup(popupText);

    };

    return {
        load_leaflet:load_leaflet,
        load_test_polygon:load_test_polygon,
        load_map:load_map,
        load_initialBaseLayers:load_initialBaseLayers,
        load_tileLayer:load_tileLayer,
        load_wmsLayer:load_wmsLayer,
        load_geoJsonLayer:load_geoJsonLayer,
        load_imageLayer:load_imageLayer,
        set_view:set_view,
        add_marker:add_marker,
        add_circle:add_circle,
        add_polygon:add_polygon,
        add_polyline:add_polyline,
        add_layerControls:add_layerControls,
        load_image:load_image,
        getRestoGeoJSON:getRestoGeoJSON,
        remove_tmp_shape:remove_tmp_shape,
        draw_point_tmp_marker:draw_point_tmp_marker,
        draw_rect_tmp_marker:draw_rect_tmp_marker,
        draw_poly_tmp_marker:draw_poly_tmp_marker

    };

});



