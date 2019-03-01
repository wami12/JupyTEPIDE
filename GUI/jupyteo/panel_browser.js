// File jupyteo/panel_browser.js
// By: Michał Bednarczyk
// Copyright (C) 2017-2019 .....
//
//  Distributed under the terms of the BSD License.
// ---------------------------------------------------------------------------
//Side panel for file/notebook/etc. browser displaying

define([
    'require',
    'jquery',
    'base/js/namespace',
    'base/js/events',
    'base/js/utils',
    'services/config',
    'tree/js/notebooklist',
    'tree/js/sessionlist',
    'contents',
    'base/js/page',
    './code_snippets',
    './map_browser',
    './leaflet_interface',
    './content_access',
    'base/js/keyboard',
    'base/js/dialog'
], function (require,
             $,
             IPython, //or Jupyter
             events,
             utils,
             config,
             notebooklist,
             sesssionlist,
             contents_service,
             page,
             code_snippets,
             map_browser,
             leaflet_interface,
             content_access,
             keyboard,
             dialog
) {
    'use strict';
// create config object to load parameters
    //   var base_url = utils.get_body_data('baseUrl');
    //   var config = new configmod.ConfigSection('notebook', {base_url: base_url});

//****
    var side_panel_min_rel_width = 10;
    var side_panel_max_rel_width = 90;
    var side_panel_start_width = 32;
    var map_panel = map_browser.build_map_panel();
    var map_toolbar = $('<div/>',{class:'map_browser_toolbar'});

    //** data_search_toggle **
    //check_visibility - use this parameter to check whether data_layer_browser is visible and if it is visible, don't toggle it.
    function data_search_toggle (check_visibility){
        check_visibility = check_visibility || false;
        if (!check_visibility) {
            $('.data_browser_panel .data_search').slideToggle();
            $('.data_browser_panel .data_layer_browser').slideToggle();
        }
        else {
            var searchBtn = $('button#searchBtn');
            var layerBrowseBtn = $('button#layerBrowseBtn');
            var toggleBtn = $('button#toggleBtn');

                 if($('.data_browser_panel').is(':hidden')){

                     $('.data_browser_panel').show();
                     $('.data_browser_panel .data_search').hide();

                     layerBrowseBtn.removeClass('inactive').addClass('selected');
                     searchBtn.removeClass('selected');
                     toggleBtn.addClass('fa-toggle-up').removeClass('fa-toggle-down');
                 }
                 else if($('.data_browser_panel .data_search').is(':visible') & $('.data_browser_panel .data_layer_browser').is(':hidden')){
                     $('.data_browser_panel .data_search').hide();
                     $('.data_browser_panel .data_layer_browser').show();
                     searchBtn.removeClass('selected');
                 }
                 else if ($('.data_browser_panel .data_search').is(':hidden') & $('.data_browser_panel .data_layer_browser').is(':visible')){
                 }
        }
    }
    //*** checkDateRange ***
    function checkDateRange(startVal,endVal){
        var dFrom = new Date(startVal);
        var dTo = new Date(endVal);
        var checkResult = 'ok';

        if (dFrom!='Invalid Date'){
            if(dTo!='Invalid Date'){
                if (dTo-dFrom<0){
                    checkResult = 'Start Date can not be later than Completion Date. Please correct.';
                }
            }
            else{
                checkResult='Invalid Completion Date format.';
            }
        }
        else {
         checkResult='Invalid Start Date format.';
        }
     return checkResult;
    }
    //*** build_side_panel ***
    function build_side_panel (main_panel, side_panel, min_rel_width, max_rel_width) {
        if (min_rel_width === undefined) min_rel_width = 0;
        if (max_rel_width === undefined) max_rel_width = 100;

        side_panel.css('display', 'none');

        side_panel.insertAfter(main_panel);

        var side_panel_splitbar = $('<div class="side_panel_splitbar"/>');
        var side_panel_inner = $('<div class="side_panel_inner"/>');
        var side_panel_expand_contract = $('<button>',{class:"btn btn-default fa fa-expand hidden-print"});
        map_toolbar.append(side_panel_expand_contract);
        side_panel.append(side_panel_splitbar);
        side_panel.append(side_panel_inner);
        side_panel_inner.append(map_toolbar);

        side_panel_expand_contract.attr({
            title: 'expand/contract panel'
        }).click(function () {

            var open = $(this).hasClass('fa-expand');
            var site = $('#site');
            slide_side_panel(main_panel, side_panel,
                open ? 100 : side_panel.data('last_width') || side_panel_start_width);
            $(this).toggleClass('fa-expand', !open).toggleClass('fa-compress', open);

            var tooltip_text = (open ? 'shrink to not' : 'expand to') + ' fill the window';
            if (open) {
                side_panel.insertAfter(site);
                site.slideUp();
                $('#header').slideUp();
                side_panel_inner.css({'margin-left': 0});
                side_panel_splitbar.hide();
            }
            else {
                side_panel.insertAfter(main_panel);
                $('#header').slideDown();
                site.slideDown({
                    complete: function () {
                        events.trigger('resize-header.Page');
                    }
                });
                side_panel_inner.css({'margin-left': ''});
                side_panel_splitbar.show();
            }
            //for display improvement
            Jupyteo.leafletMap.invalidateSize();
        });

        // bind events for resizing side panel
        side_panel_splitbar.mousedown(function (md_evt) {
            md_evt.preventDefault();
            $(document).mousemove(function (mm_evt) {
                mm_evt.preventDefault();
                var pix_w = side_panel.offset().left + side_panel.outerWidth() - mm_evt.pageX;
                var rel_w = 100 * (pix_w) / side_panel.parent().width();
                rel_w = rel_w > min_rel_width ? rel_w : min_rel_width;
                rel_w = rel_w < max_rel_width ? rel_w : max_rel_width;
                main_panel.css('width', (100 - rel_w) + '%');
                side_panel.css('width', rel_w + '%').data('last_width', rel_w);
            });
            return false;
        });
        $(document).mouseup(function (mu_evt) {
            $(document).unbind('mousemove');
            Jupyteo.leafletMap.invalidateSize(); //to resize leaflet map
        });

        //** BUTTONS **
        //toggle button
        var toggle_button =$('<button/>',{id:'toggleBtn',class:"btn btn-default fa fa-toggle-down",title:"Toggle search panel"});
        toggle_button.click(function(){
            data_browser.slideToggle(function(){
                if ($('button#searchBtn').hasClass('selected') | $('button#layerBrowseBtn').hasClass('selected')){
                    $('button#searchBtn').removeClass('selected');
                    $('button#layerBrowseBtn').removeClass('selected');
                    toggle_button.removeClass('fa-toggle-up');
                    toggle_button.addClass('fa-toggle-down');
                }
                else if ($('.data_browser_panel .data_layer_browser').is(':visible')){
                    $('button#searchBtn').removeClass('selected');
                    $('button#layerBrowseBtn').addClass('selected');
                    toggle_button.addClass('fa-toggle-up');
                    toggle_button.removeClass('fa-toggle-down');
                }
                else if ($('.data_browser_panel .data_search').is(':visible')) {
                    $('button#searchBtn').addClass('selected');
                    $('button#layerBrowseBtn').removeClass('selected');
                    toggle_button.addClass('fa-toggle-up');
                    toggle_button.removeClass('fa-toggle-down');

                }
            });
        });
        map_toolbar.append(toggle_button);

        //search button
        var search_button =$('<button/>',{id:'searchBtn',class:"btn btn-default fa fa-search",title:"Search for EO data"});
        search_button.click(function(){
            search_button.addClass('selected');

            if ($('.data_browser_panel').is(':visible')){
                $('.data_browser_panel .data_layer_browser').hide();
                $('.data_browser_panel .data_search').show();
            }
            else {
                data_browser.slideToggle();
                $('.data_browser_panel .data_layer_browser').hide();
                $('.data_browser_panel .data_search').show();
            }
            $('button#toggleBtn').removeClass('fa-toggle-down');
            $('button#toggleBtn').addClass('fa-toggle-up');
            $('button#searchBtn').addClass('selected');
            $('button#layerBrowseBtn').removeClass('selected');
            $('button#toggleBtn').addClass('fa-toggle-up').removeClass('fa-toggle-down');
        });
        map_toolbar.append(search_button);

        //layer_browser_button
        var layer_browser_button =$('<button/>',{id:'layerBrowseBtn',class:"btn btn-default fa fa-table",title:"Layer data view"});
        layer_browser_button.click(function(){
                if ($('.data_browser_panel').is(':visible')){
                    $('.data_browser_panel .data_search').hide();
                    $('.data_browser_panel .data_layer_browser').show();
                }
                else{
                    data_browser.slideToggle();
                    $('.data_browser_panel .data_search').hide();
                    $('.data_browser_panel .data_layer_browser').show();
                }

                $('button#searchBtn').removeClass('selected');
                $('button#layerBrowseBtn').addClass('selected');
                $('button#toggleBtn').addClass('fa-toggle-up').removeClass('fa-toggle-down');
        });
        map_toolbar.append(layer_browser_button);

        //remove_layers_button
        var remove_layers_button = $('<button/>',{id:'removeLayersBtn',class:"btn btn-default fa fa-remove",title:"Remove all layers"});
        remove_layers_button.click(function(){
            showRemoveAllLayersDialog();
        });
        map_toolbar.append(remove_layers_button);

        //geojson_to_map_button
        var geojson_to_map_button = $('<button/>',{id:'geojsonToMapBtn',class:"btn btn-default fa fa-file-image-o",title:"Add GEOJSON layer file to map"});
        geojson_to_map_button.click(function(){
            showAddGeojsonFromSelectedFilesDialog();
        });
        map_toolbar.append(geojson_to_map_button);

         //recursive_delete_button
         var recursive_delete_button = $('<button/>',{id:'recursiveDeleteBtn',class:"btn btn-danger fa fa-trash",title:"Recursively delete selected files and folders"});
         recursive_delete_button.click(function(){

             showRecursiveDeleteDialog();
         });
         map_toolbar.append(recursive_delete_button);


        //** PANELS **
        //**** browser panel
        var data_browser = $('<div/>',{class:'data_browser_panel'});
        var data_search = $('<div/>',{class:'data_browser_panel data_search'});
        var data_layer_browser = $('<div/>',{class:'data_browser_panel data_layer_browser'})
            .hide();
        data_browser.append(data_search);
        data_browser.append(data_layer_browser);

        //set data
        var missions = [
            {name:"All", instrument:['All','MERIS','TM','ETM','OLI','OLI_TIRS','TIRS','SAR','MSI','OLCI','SLSTR','SR','OL','SL']},
            {name:"Envisat",instrument:['MERIS']},
            {name:"Landsat5",instrument:['TM']},
            {name:"Landsat7",instrument:['ETM']},
            {name:"Landsat8",instrument:['All','OLI','OLI_TIRS','TIRS']},
            {name:"Sentinel1",instrument:['SAR']},
            {name:"Sentinel2",instrument:['MSI']},
            {name:"Sentinel3",instrument:['All','OL','SL','SR']}
            ];

        //set controls
        //missionComboBOx
        var missionComboBox = $('<select/>',{
            class:'data_browser_combobox',id:'mission',title:'Mission name',
            style:'width:6em'
        });
        for (var i=0;i<missions.length;i++){
         missionComboBox.append($('<option/>',{value:i}).html(missions[i].name));
        }
        missionComboBox.on('change',function(){
            $('.data_browser_combobox#instrument').find('option').remove();
            var missionIdx = $('.data_browser_combobox#mission').find('option:selected').val();
            for (i=0;i<missions[missionIdx].instrument.length;i++){
                instrumentComboBox.append($('<option/>').html(missions[missionIdx].instrument[i]));
            }
        });
        var missionComboboxLbl = $('<label/>').html('Mission');

        //instrumentComboBox
        var instrumentComboBox = $('<select/>',{
            class:'data_browser_combobox',id:'instrument',title:'Instrument',
            style:'width:6em'
        });
        for (i=0;i<missions[0].instrument.length;i++){
            instrumentComboBox.append($('<option/>').html(missions[0].instrument[i]));
        }
        var instrumentComboboxLbl = $('<label/>').html('Instrument');

        //maxRecordsInput
        var maxRecordsInput = $('<input/>',{
            type:'number',min:'1',name:'maxRecords',value:'50',class:'data_browser_input',id:'maxRecords',step:'1',required:'true',title:'Max records count to display',
            style:'width:5em;'
        }).on('change',function(){
            var maxRecordsStr = $('.data_browser_input[name=maxRecords]').val();
            if ($.isNumeric(maxRecordsStr)){
                if(maxRecordsStr>10000){
                    $('.data_browser_input[name=maxRecords]').val(10000);
                }
                if(maxRecordsStr<1){
                    $('.data_browser_input[name=maxRecords]').val(1);
                }
            }
            else $('.data_browser_input[name=maxRecords]').val(1);
        }).on('focusin',function(){
            Jupyter.notebook.keyboard_manager.disable();
        }).on('focusout',function(){
            Jupyter.notebook.keyboard_manager.enable();
        });
        var maxRecordsLbl = $('<label/>').html('Max');

        var layerName = "";

        //dateFromInput
        var dateFromInput = $('<input/>',{
            class:'data_browser_input', id:'dateFrom', type:'text', title:'Start date',
            style:'width:8em;'
        }).datepicker({
                defaultDate:new Date(),
                dateFormat: 'yy-mm-dd',
                changeMonth:true,
                changeYear:true,
                showButtonPanel:true,
                yearRange:'1970:'+ new Date().getFullYear(),
                beforeShow: function() {
                    setTimeout(function(){
                        $('.ui-datepicker').css('z-index', 9999999999);
                    }, 0);
                }
            }).attr("placeholder", "yyyy-mm-dd")
            .val('2010-01-01')
            .on('focusin',function(){
                Jupyter.notebook.keyboard_manager.disable();
            })
            .on('focusout',function(){
                Jupyter.notebook.keyboard_manager.enable();
            });

        var dateFromLbl = $('<label/>').html('From');

        //dateToInput
        var dateToInput = $('<input/>',{
            class:'data_browser_input', id:'dateTo', type:'text', title:'Completion date',
            style:'width:8em;'
        }).datepicker({
            defaultDate:new Date(),
            dateFormat: 'yy-mm-dd',
            changeMonth:true,
            changeYear:true,
            showButtonPanel:true,
            yearRange:'1970:'+ new Date().getFullYear(),
            beforeShow: function() {
                setTimeout(function(){
                    $('.ui-datepicker').css('z-index', 9999999999);
                }, 0);
            }
        }).attr("placeholder", "yyyy-mm-dd")
            .on('focusin',function(){
            Jupyter.notebook.keyboard_manager.disable();
        })
            .on('focusout',function(){
                Jupyter.notebook.keyboard_manager.enable();

            });

        var dateToLbl = $('<label/>').html('To');

        //useDateCheckbox
        var useDateCheckbox = $('<input/>',{
            type:'checkbox',
            value:'Use date',
            id:'useDateCheckbox',
            class:'data_browser_checkbox'
        });
        useDateCheckbox = $('<label/>').html('Use date').prepend(useDateCheckbox);

        //send query, load result to map
        //searchButton
        var searchButton = $('<buton/>',{id:'restoSearchBtn', class:'btn btn-default btn-sm btn-primary',title:'Search and display on the map'})
            .html('Search')
            .click(function(){
                //check if dates are properly inserted
                var check = checkDateRange($('#dateFrom.data_browser_input').val(),$('#dateTo.data_browser_input').val());
                if (check!='ok' & $('#useDateCheckbox').is(':checked')){
                    alert(check);
                    return //stop and do nothing above
                }

            //prepare query string
            var missionStr = $('.data_browser_combobox#mission').find('option:selected').text()+'/';
            layerName = missionStr.slice(0,-1)+'_';
            if (missionStr==='All/'){missionStr='/'}
            var instrumentStr = $('.data_browser_combobox#instrument').find('option:selected').text();
            layerName=layerName+instrumentStr;
            if (instrumentStr==='All'){
                instrumentStr=''
            }
            else {
                instrumentStr = "&instrument="+instrumentStr;
            }

            var maxRecordsStr = $('.data_browser_input[name=maxRecords]').val();
            if ($.isNumeric(maxRecordsStr)){
                     maxRecordsStr = '&maxRecords='+maxRecordsStr;
             }
             else maxRecordsStr='';

            if($('input[type=checkbox]#useDateCheckbox').is(':checked')){
                var startDateStr = $('.data_browser_input#dateFrom').val();
                var completionDateStr = $('.data_browser_input#dateTo').val();
                startDateStr = '&startDate='+startDateStr;
                completionDateStr = '&completionDate='+completionDateStr;
            }
            else {
                startDateStr = '';
                completionDateStr = '';
            }

            var geometryStr='';
            if (Jupyteo.leafletMap.tmpShapeWKT=='undefined'){
                geometryStr='';
            }
            else{
                geometryStr='&geometry='+Jupyteo.leafletMap.tmpShapeWKT;
            }

            var queryStr = 'https://finder.eocloud.eu/resto/api/collections/'
                +missionStr
                +'search.json?_pretty=true'
                +maxRecordsStr
                +instrumentStr
                +startDateStr
                +completionDateStr
                +geometryStr;

            $('#restoSearchBtnIcon').show();
            var geoJSON = leaflet_interface.getRestoGeoJSON(queryStr);
            console.log(queryStr);

            Jupyteo.marker.remove();
            leaflet_interface.remove_tmp_shape();
            console.log(geoJSON);

            //todo: add more than one search layer, number search layers, add style attributes (now empty)
            layerName=layerName+'_'+geoJSON.features.length+'_of_'+geoJSON.properties.totalResults+'_total_results';

            Jupyteo.leafletMap.ids = [];
            //add layer, set options for layer (style, events, etc.)
            Jupyteo.map_addGeoJsonLayer(geoJSON,layerName,{
                color:'#161ce9',
                onEachFeature: function(feature,layer){
                 layer.bindPopup(function(layer){
                     var collection = layer.feature.properties.collection;
                     var productID = layer.feature.properties.productIdentifier;
                     var completionDate = layer.feature.properties.completionDate;
                     var thumbnail = layer.feature.properties.thumbnail;
                     var platform = layer.feature.properties.platform;
                     var productType = layer.feature.properties.productType;
                     var thumbnailTxt = "No picture";
                     if (thumbnail!=="null") thumbnailTxt="Thumbnail picture";

                     var popup = "<b>Collection: </b>"+collection+" "+
                         "<br/>"+"<b>Platform:</b> "+platform+
                         "<br/><b>Product type:</b> "+productType+
                         "<br/><b>Product identifier:</b><a href='#' onclick='Jupyteo.copyProductIDToCell("+layer._leaflet_id+")' style='text-decoration: none; background: #0b2283; border-radius: 4px; padding: 1px; color:white;margin-bottom:1px'>Copy</a><br/>" +
                         "<div style='font-size:10px;box-shadow: 0px 0px 1px black;width:200px;height:60px;overflow-y: scroll;word-wrap:break-word;'>"+
                         productID+"</div><div style='margin-bottom:2px;margin-top:2px;'><b>Completion date: </b><br/>"+completionDate+"" +
                         "</div><img alt='No picture' src='"+thumbnail+"' style='width:200px;'></img>";
                     //return layer.feature.properties.description;
                     return popup;
                 });
                    layer.on({
                     mouseover: function(e){
                         layer.setStyle({color:'#e97916'});
                     },
                     mouseout: function(e){
                         layer.setStyle({color:'#161ce9'});
                     },
                     load: function(){
                     }
                 })
                }
            });
            Jupyteo.showLayerFeaturesData(layerName);
            Jupyteo.map_fitToLayer(layerName);
        });

        //search icon
        var searchButtonIcon = $('<i/>',{id: 'restoSearchBtnIcon', class:'fa fa-spinner fa-spin'}).hide();
        searchButton.append(searchButtonIcon);

        //insert search shape button
        var insertSearchShapeButton = $('<buton/>',{
            class:'btn btn-default btn-sm btn-primary',
            title:'Mark search shape on map',
            style:'margin-left:3px;margin-right:3px;',
            id:'insertSearchShapeButton'
        })
            .html('Mark shape')
            .click(function(){
                var options = {
                    templineStyle: {},
                    hintlineStyle: {},
                    pathOptions: {
                        // add leaflet options for polylines/polygons
                        color: '#f50534',
                        fillColor: 'f50534',
                    },
                };
                //scroll to map view todo: it can be disabled
                $('.side_panel_inner').scrollTop($('.side_panel_inner').height());

                var shpTypeStr = $('.data_browser_combobox#shapeType').find('option:selected').text();
                if (shpTypeStr=="Point"){
                leaflet_interface.draw_point_tmp_marker();
                }
                else if (shpTypeStr=="Rectangle") {
                    leaflet_interface.draw_rect_tmp_marker(options);
                }
                else if (shpTypeStr=="Polygon") {
                    leaflet_interface.draw_poly_tmp_marker(options);
                }
                $('#insertSearchShapeButton').addClass('selected');
            });

        //select marking shape type combobox - for resto searching shape type marker
        var selectShapeTypeCombobox = $('<select/>',{
            class:'data_browser_combobox',id:'shapeType',title:'Shape type',
            style:'width:7em'
        });
        var tmpShapes = ["Polygon","Rectangle","Point"];
        for (i=0;i<tmpShapes.length;i++){
            selectShapeTypeCombobox.append($('<option/>').html(tmpShapes[i]));
        }

        //Button for copying WKT of inserted temp shape - to insert it into selected cell
        var copyShpWKTBtn = $('<button/>',{
            class:'btn btn-default btn-sm btn-primary',
            title:'Copy shape\'s WKT to selected cell',
            style:'margin-left:3px;margin-right:3px;',
            id:'copyShapeWKTButton'
        })
            .html('Copy WKT')
            .click(function(){
                var cell = Jupyter.notebook.get_selected_cell();
                if (Jupyteo.leafletMap.tmpShapeWKT!='undefined') {
                        cell.set_text(cell.toJSON().source + Jupyteo.leafletMap.tmpShapeWKT+'\n');
                    Jupyteo.insert_cell1()
                }
            });

        var missionControlGroup = $('<div/>',{class:'data_browser_controlgroup', id:'1'});
        missionControlGroup
            .append(missionComboboxLbl)
            .append(missionComboBox)
            .append(instrumentComboboxLbl)
            .append(instrumentComboBox)
            .append(maxRecordsLbl)
            .append(maxRecordsInput);
        data_search.append(missionControlGroup);

        missionControlGroup = $('<div/>',{class:'data_browser_controlgroup', id:'2'});
        missionControlGroup
            .append(dateFromLbl)
            .append(dateFromInput)
            .append(dateToLbl)
            .append(dateToInput)
            .append(useDateCheckbox);
        data_search.append(missionControlGroup);

        missionControlGroup = $('<div/>',{class:'data_browser_controlgroup', id:'3'});
        missionControlGroup
            .append(searchButton)
            .append(insertSearchShapeButton)
            .append(selectShapeTypeCombobox)
            .append(copyShpWKTBtn);
        data_search.append(missionControlGroup);

        map_toolbar.append(data_browser);
        data_browser.hide();
        Jupyteo.emptyLayerBrowser();

        //**** end of browser panel

        return side_panel;
    }
    function slide_side_panel (main_panel, side_panel, desired_width) {

        var anim_opts = {
            step: function (now, tween) {
                main_panel.css('width', 100 - now + '%');
            }
        };

        if (desired_width === undefined) {
            if (side_panel.is(':hidden')) {
                desired_width = (side_panel.data('last_width') || side_panel_start_width);
            }
            else {
                desired_width = 0;
            }
        }

        var visible = desired_width > 0;
        if (visible) {
            main_panel.css({float: 'left', 'overflow-x': 'auto'});
            side_panel.show();
        }
        else {
            anim_opts['complete'] = function () {
                side_panel.hide();
                main_panel.css({float: '', 'overflow-x': '', width: ''});
            };
        }

        side_panel.animate({width: desired_width + '%'}, anim_opts).promise().then(function(){Jupyteo.leafletMap.invalidateSize();});//invalidateSize odpali po zakończeniu animacji


        return visible;
    }
    //makes only <a> element
    var make_tab_a = function (href_, text, expanded) {
        var tab_link = $('<a/>', {href: href_}).html(text);
        tab_link.attr('data-toggle', 'tab');
        tab_link.attr('aria-expanded', expanded);
        return tab_link;
    };

    var make_tab_li = function () {
        var tabsLi = $('<li/>');
        return tabsLi;
    };

    var make_tab_div = function (class_, id_) {
        var tab_div = $('<div/>', {id: id_}).addClass(class_);
        return tab_div;
    };

    function row_item(name, link, time, status, icon, on_click) {
        this.name = name;
        this.link = link;
        this.time = time;
        this.status = status;
        this.icon = icon;
        this.on_click = on_click;
    }

    var make_row_item = function (row_item) {
        var item_row = $('<div/>').addClass('list_item row');
        var colDiv = $('<div/>').addClass('col-md-12');
        var itemType = row_item.type;
        var iconName = 'file_icon';
        if (itemType === 'notebook') {
            iconName = 'notebook_icon'
        } else if (itemType === 'directory') {
            iconName = 'folder_icon'
        }
        var checkbox = $('<input>',
            {
                title: 'Click here to rename, delete, etc.',
                type: 'checkbox'
            });

        if (row_item.name!='...'){
            colDiv.append(checkbox);
        } else {
            colDiv.append(checkbox.attr('style', 'visibility: hidden;'))
        }
        colDiv.append(

            $('<i/>').addClass('item_icon ' + iconName +' icon-fixed-width')
        );
        var itemName = $('<span/>',{path:row_item.path}).addClass('item_name').html(row_item.name);

        var a_link = $('<a/>',
            {
                href: row_item.link  //'/tree/anaconda3/bin',
            }).addClass('item_link').append(itemName).attr('onclick',row_item.onclick);//.bind('click',{},removeTabContent);

        if (row_item.on_click) {
            a_link.bind('click', {snippet_name: row_item.snippet_name},
                row_item.on_click);
        }

        colDiv.append(a_link);

        colDiv.append(
            $('<span/>', {
                title: '017-08-24 13:35'
            }).addClass('item_modified pull-right').html(row_item.time)//.click(code_snippets.insert_snippet_cell)
        );


        var DivLast = $('<div/>').addClass('item_buttons pull-right');
        var DivLast1 = $('<div/>', {style: 'visibility: hidden;'}).addClass('running-indicator').html(row_item.status);
        colDiv.append(
            $('<div/>').addClass('item_buttons pull-right'
            ).append(DivLast1)
        );

        DivLast.append();

        item_row.append(colDiv);
        return item_row;
    };

    //*** removeTabContent ***
    //Function for removing content from tabs "Notebooks" and "Files"
    function removeTabContent(options){
        //#karta - files, #3karta - notebooks
        $(options.DOMelement+' .list_item').remove();
    }
    function readDir(options){
        removeTabContent(options);
        loadTabContent({path:options.path,contents:options.contents,DOMelement:options.DOMelement});

    }
    //*** loadTabContent ***
    //Function for loading content into "Notebooks" and "Files" tabs
    //loadTabContent({contents:notebooks,DOMelement:'#3karta'})
    function loadTabContent(options){

        var homePath = utils.url_path_join(Jupyter.notebook.base_url, 'tree');
        var editPath = utils.url_path_join(Jupyter.notebook.base_url, 'edit');
        var viewPath = utils.url_path_join(Jupyter.notebook.base_url, 'view');
        var elementsList;
        var rowItemArray = [];
        var n;

        //removeTabContent(options.DOMelement);
        if (options.contents==="notebooks") {
            elementsList = content_access.get_NotebooksListDir(options.path);
        }
        if (options.contents==="files") {
            elementsList = content_access.get_FilesListDir(options.path);
        }

        //"go to previous directory" element - first element of the list
        //prepare path to previous directory
        var path_previous=options.path;
        var path_this = path_previous;
        if (path_previous.search("/")!=-1){
            path_previous = path_previous.slice(0,path_previous.lastIndexOf("/"))
        }
        else path_previous='';

        rowItemArray[0] = {
            name: '...',
            link:'#',
            type: 'directory',
            onclick: 'Jupyteo.readDir({DOMelement:"'+options.DOMelement+'",path:"'+path_previous+'",contents:"'+options.contents+'"})'
        };

        for (i = 0; i < elementsList.length; i++) {
            var timeStr=elementsList[i].last_modified;
            timeStr=timeStr.substring(0,timeStr.search("T"));
            n = i+1;
             rowItemArray[n] = {
                 name: elementsList[i].name,
                 time: timeStr,
                 type: elementsList[i].type,
                 mimetype: elementsList[i].mimetype
             };

             rowItemArray[n].path = elementsList[i].path;

             if (rowItemArray[n].type==='file'){
                 if (rowItemArray[n].mimetype==='text/plain'){
                     rowItemArray[n].link=utils.url_path_join(editPath, elementsList[i].path);
                 }
                 else if (rowItemArray[n].mimetype==='image/png'){
                     rowItemArray[n].link=utils.url_path_join(viewPath, elementsList[i].path);
                 }
                 else rowItemArray[n].link=utils.url_path_join(homePath, elementsList[i].path);
             }
             if (rowItemArray[n].type==='directory'){
                 rowItemArray[n].link='#';
                 rowItemArray[n].onclick='Jupyteo.readDir({DOMelement:"'+options.DOMelement+'",path:"'+elementsList[i].path+'",contents:"'+options.contents+'"})';
             }
             if (rowItemArray[n].type==='notebook'){
                rowItemArray[n].link=utils.url_path_join(homePath, elementsList[i].path);
             }
        }

        for (var i = 0; i < rowItemArray.length; i++) {
            $(options.DOMelement).append(make_row_item(rowItemArray[i]));
        }
    }

    // Inserting into panel
    // This method stands for panel content loading - Tabs here
    var insert_into_side_panel = function (side_panel) {
        var side_panel_inner = side_panel.find('.side_panel_inner');

        //**Tabs in bootstrap
        //tabs headers
        var tabsUl = $('<ul/>', {id: 'tabs'}).addClass('nav nav-tabs'); //mozna dodac 'nav-justified'
        var tabsLiActive = $('<li/>').addClass('active');

        tabsUl.append(tabsLiActive.append(make_tab_a('#1karta', 'Map', 'true')));
        tabsUl.append(make_tab_li().append(make_tab_a('#2karta', 'Snippets', 'false')));
        tabsUl.append(make_tab_li().append(make_tab_a('#3karta', 'Notebooks', 'false')));
        tabsUl.append(make_tab_li().append(make_tab_a('#4karta', 'Files', 'false')));

        $('.map_browser_toolbar').append(tabsUl);
        // Tabs content
        var tabContDiv = $('<div/>').addClass('tab-content').css({height:'85%'});

        make_tab_div('tab-pane active', '1karta').appendTo(tabContDiv);
        make_tab_div('tab-pane', '2karta').appendTo(tabContDiv);
        make_tab_div('tab-pane', '3karta').appendTo(tabContDiv);
        make_tab_div('tab-pane', '4karta').appendTo(tabContDiv);

        side_panel_inner.append(tabContDiv);

        //**End of tabs in bootstrap

        //for Leaflet - map refresh
        $('.nav-tabs a').on('shown.bs.tab', function(event){Jupyteo.leafletMap.invalidateSize()});

        var rowItemArray = [];
        var i;
//Files Tab
        loadTabContent({path:'',contents:'files',DOMelement:'#4karta'});

//Notebooks Tab
        loadTabContent({path:'notebooks',contents:'notebooks',DOMelement:'#3karta'});

//Snippets Tab
        var menu_snippets = $('<div/>').addClass('menu_snippets');
        var menu_item;
        var menu_groupsList = code_snippets.getSnippetsGroups();

        //loading snippets groups from JSON, making headers and empty content DOM elements
        //creating empty menu with groups headers
        if (menu_groupsList){
          for (i=0;i<menu_groupsList.length;i++){
             var group_name = menu_groupsList[i].group_name;
             var group_id = menu_groupsList[i].group_id;
             menu_item = code_snippets.make_snippets_menu_group({group_name:group_name,id:group_id});
             menu_snippets.append(menu_item.header).append(menu_item.content);
             menu_item={};
          }
            $('#2karta').append(menu_snippets);
          //Load snippets from JSON
          // loading menu snippets items content (snippets names) into appropriate groups
          //creating menu with groups headers and grouped items
          var snippetsList = [];
          snippetsList = code_snippets.getSnippetsList1();
          for (i = 0; i < snippetsList.length; i++) {
            code_snippets.addSnippetToUI(snippetsList[i].group,snippetsList[i].name);
           }
        }
        else {
            $('#2karta').append($('<div/>').html('Falied to load snippets. Check console log.'));
        }

//Map Tab
        $('#1karta').append(map_panel).css({height:'100%'});
        leaflet_interface.load_map("map_container");
        leaflet_interface.load_initialBaseLayers();
    };

    function togglePanel() {
        var main_panel = $('#notebook_panel');
        var side_panel = $('#side_panel');
        if (side_panel.length < 1) {
            side_panel = $('<div id="side_panel"/>');
            build_side_panel(main_panel, side_panel,
                side_panel_min_rel_width, side_panel_max_rel_width);
            insert_into_side_panel(side_panel);
        }

        var visible = slide_side_panel(main_panel, side_panel);
        return visible;
    }
//***
    //SHOWING DIALOGS
    function showAddGeojsonFromSelectedFilesDialog(){
        //***
        var options = {};
        var dialog_body = $('<div/>').append(
            $("<p/>").addClass("rename-message")
                .text('Do you want to add selected GEOJSON files to map as separate layers?')
        );
        var d = dialog.modal({
            title: "Add selected GEOJSON files to map",
            body: dialog_body,
            notebook: options.notebook,
            keyboard_manager: Jupyter.notebook.keyboard_manager,//if this is not set, keyboard input will be impossible
            default_button: "Cancel",
            buttons : {
                "Cancel": {},
                "Add": {
                    class: "btn-primary",
                    click: function () {
                        Jupyteo.map_addGeoJsonFromSelectedFiles();
                        d.modal('hide');
                    }
                }
            },
            open : function () {
                /**
                 * Upon ENTER, click the OK button.
                 */
                //if keyboard_manager is not defined, each textbox (input[type="text"]) should has registered keyboard
                // events like below:
                //Jupyter.notebook.keyboard_manager.register_events(d.find('input[type="text"]'));

                d.find('input[type="text"]').keydown(function (event) {
                    if (event.which === keyboard.keycodes.enter) {
                        d.find('.btn-primary').first().click();
                        return false;
                    }
                });
                d.find('input[type="text"]').focus().select();
            }
        });
        //***
    }
    function showRecursiveDeleteDialog(){
        //***
        var options = {};
        var dialog_body = $('<div/>').append(
            $("<p/>").addClass("rename-message")
                .text('All selected files and folders will be deleted recursively. Do you want to proceed?')
        );
        var d = dialog.modal({
            title: "Delete selected files and folders",
            body: dialog_body,
            notebook: options.notebook,
            keyboard_manager: Jupyter.notebook.keyboard_manager,//if this is not set, keyboard input will be impossible
            default_button: "Cancel",
            buttons : {
                "Cancel": {},
                "Delete": {
                    class: "btn-primary",
                    click: function () {
                        Jupyteo.recursiveDeleteSelected();
                        d.modal('hide');
                    }
                }
            },
            open : function () {
                /**
                 * Upon ENTER, click the OK button.
                 */
                //if keyboard_manager is not defined, each textbox (input[type="text"]) should has registered keyboard
                // events like below:
                //Jupyter.notebook.keyboard_manager.register_events(d.find('input[type="text"]'));

                d.find('input[type="text"]').keydown(function (event) {
                    if (event.which === keyboard.keycodes.enter) {
                        d.find('.btn-primary').first().click();
                        return false;
                    }
                });
                d.find('input[type="text"]').focus().select();
            }
        });
        //***
    }
    function showRemoveAllLayersDialog(){
        //***
        var options = {};
        var dialog_body = $('<div/>').append(
            $("<p/>").addClass("rename-message")
                .text('Do you really want to remove all layers from map? Only base layers will not be deleted.')
        );
        var d = dialog.modal({
            title: "Remove all layers confirmation",
            body: dialog_body,
            notebook: options.notebook,
            keyboard_manager: Jupyter.notebook.keyboard_manager,//if this is not set, keyboard input will be impossible
            default_button: "Cancel",
            buttons : {
                "Cancel": {},
                "Remove": {
                    class: "btn-primary",
                    click: function () {
                        Jupyteo.map_removeAllLayers();
                        d.modal('hide');
                    }
                }
            },
            open : function () {
                /**
                 * Upon ENTER, click the OK button.
                 */
                //if keyboard_manager is not defined, each textbox (input[type="text"]) should has registered keyboard
                // events like below:
                //Jupyter.notebook.keyboard_manager.register_events(d.find('input[type="text"]'));

                d.find('input[type="text"]').keydown(function (event) {
                    if (event.which === keyboard.keycodes.enter) {
                        d.find('.btn-primary').first().click();
                        return false;
                    }
                });
                d.find('input[type="text"]').focus().select();
            }
        });
        //***
    }
    function showRemoveLayerDialog(layer_name){
        //***
        var options = {};
        var dialog_body = $('<div/>').append(
            $("<p/>").addClass("rename-message")
                .text('Do you really want to remove layer: "'+layer_name+'" from map?')
        );
        var d = dialog.modal({
            title: "Remove layer confirmation",
            body: dialog_body,
            notebook: options.notebook,
            keyboard_manager: Jupyter.notebook.keyboard_manager,//if this is not set, keyboard input will be impossible
            default_button: "Cancel",
            buttons : {
                "Cancel": {},
                "Remove": {
                    class: "btn-primary",
                    click: function () {
                        Jupyteo.map_removeLayer(layer_name);
                        d.modal('hide');
                    }
                }
            },
            open : function () {
                /**
                 * Upon ENTER, click the OK button.
                 */
                //if keyboard_manager is not defined, each textbox (input[type="text"]) should has registered keyboard
                // events like below:
                //Jupyter.notebook.keyboard_manager.register_events(d.find('input[type="text"]'));

                d.find('input[type="text"]').keydown(function (event) {
                    if (event.which === keyboard.keycodes.enter) {
                        d.find('.btn-primary').first().click();
                        return false;
                    }
                });
                d.find('input[type="text"]').focus().select();
            }
        });
        //***
    }
    function load_ipython_extension() {

        //link css for own panel
        $('head').append(
            $('<link/>', {
                rel: 'stylesheet',
                type: 'text/css',
                href: require.toUrl('./css/panel_browser.css')
            })
        );

        var action = {
            icon: 'fa-film', //font-awesome
            help: 'Toggle side panel',
            help_index: 'this could be help',
            handler: togglePanel
        };
        var prefix = 'panel_browser';
        var action_name = 'toggle-panel';
        var full_action_name = Jupyter.actions.register(action, action_name, prefix);
        Jupyter.toolbar.add_buttons_group([full_action_name]);

        togglePanel();
    }

    return {
        load_ipython_extension: load_ipython_extension,
        readDir:readDir,
        data_search_toggle:data_search_toggle,
        showRemoveLayerDialog:showRemoveLayerDialog
    };
});


