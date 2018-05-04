// file source_UI/code_snippets.js
// Edited by: Michał Bednarczyk
// Copyright (C) 2017 .....
//
//  Distributed under the terms of the BSD License.
// ---------------------------------------------------------------------------

define([
    'jquery',
    'contents',
    'base/js/namespace',
    'base/js/utils',
    'services/config'
], function ($, contents_service, Jupyter, utils, configmod) {
    "use strict";

    //todo: zrobić odtwarzanie pliku code_snippets.json po usunięciu przez użytkownika
    // create config object to load parameters
    var base_url = utils.get_body_data("baseUrl");
    var config = new configmod.ConfigSection('notebook', {base_url: base_url});
    //var snippets_url = require.toUrl('./code_snippets.json'); //katalog w ktorym jest nasz extension
    var CODE_SNIPPETS_FN = 'code_snippets.json';
    var parent = utils.url_path_split(Jupyter.notebook.notebook_path)[0];
    var snippets_url = utils.url_path_join(
        Jupyter.notebook.base_url, 'tree',
        utils.encode_uri_components(parent), CODE_SNIPPETS_FN); //katalog domowy

    function getBaseUrl(){
        return base_url;
    };

    function getSnippetsUrl(){
        return snippets_url;
    };

    config.loaded.then(function () {
        var dropdown = $("<select></select>").attr("id", "snippet_picker")
            .css("margin-left", "0.75em")
            .attr("class", "form-control select-xs")
            .change(insert_cell);
        Jupyter.toolbar.element.append(dropdown);
    });

    // will be called when the nbextension is loaded
    function load_extension() {
        config.load(); // trigger loading config parameters

        //katalog z plikami json
        //var cfgPath = utils.url_path_join(Jupyter.notebook.base_url, 'tree/cfg');
        //konkretny plik json
        //var jsonFileName = "/code_snippets.json";

        $.getJSON(snippets_url, function (data) {
            // Add the header as the top option, does nothing on click
            var option = $("<option></option>")
                .attr("id", "snippet_header")
                .text("Snippets");
            $("select#snippet_picker").append(option);

            // Add options for each code snippet in the snippets.json file
            $.each(data['code_snippets'], function (key, snippet) {
                var option = $("<option></option>")
                    .attr("value", snippet['name'])
                    .text(snippet['name'])
                    .attr("code", snippet['code'].join('\n'));
                $("select#snippet_picker").append(option);
            });
        })
            .error(function (jqXHR, textStatus, errorThrown) {
                // Add an error message if the JSON fails to load
                var option = $("<option></option>")
                    .attr("value", 'ERROR')
                    .text('Error: failed to load snippets!')
                    .attr("code", "");
                $("select#snippet_picker").append(option);
            });

    }


    //***
    function insert_cell() {
        var selected_snippet = $("select#snippet_picker").find(":selected");

        if (selected_snippet.attr("name") != 'header') {
            var code = selected_snippet.attr("code");
            var new_cell = Jupyter.notebook.insert_cell_above('code');
            new_cell.set_text(code);
            new_cell.focus_cell();

            $("option#snippet_header").prop("selected", true);
        }
    };

    //*** czytanie z pliku JSON po podanej nazwie snippeta
    function insert_cell1(name) {
        //handle function passed IN parameter
        var snippet_name = name.data.snippet_name;

        //czytanie jsona "/nbextensions/source_UI/code_snippets.json"

        $.getJSON(snippets_url, function (data) {
            // Insert snippet from JSON file named "snippet_name"
            $.each(data['code_snippets'], function (key, snippet) {
                if (snippet['name'] == snippet_name) {
                    var new_cell = Jupyter.notebook.insert_cell_above('');
                    new_cell.set_text(snippet['code'].join('\n'));
                    new_cell.code_mirror.setOption('theme', 'mbo');
                    new_cell.focus_cell();

                }
                ;

            });
        })
    };

    //*** zapis dowolnego tekstu jako snippeta **
    function save_asSnippet(text){

    };

    //*** zapis celki jako snippeta ***



    //*** daje listę nazw snippetów z pliku JSON
    function get_SnippetsList() {
        //to wyłącza działanie asynchroniczne funkcji $getJSON i mozna wtedy poza nią przekazać wartość zmiennej
        // (w tym przypadku tablicy snippetNames)
        $.ajaxSetup({
            async: false
        });

        var snippetsNames = [];
        //czytanie jsona
        $.getJSON(snippets_url, function (data) {
            // Insert snippet from JSON file named "snippet_name"
            $.each(data['code_snippets'], function (key, snippet) {
                snippetsNames.push(snippet['name']);
                //snippetsNames.push([{name:'Example 1',link:'#',time:'yesterday',snippet_name:'Example1',on_click:insert_cell1}]);

            });
        });

        return snippetsNames;
    };

    //*** Druga wersja - daje listę nazw snippetów w grupach
    function get_SnippetsList1(){
        //to wyłącza działanie asynchroniczne funkcji $getJSON i mozna wtedy poza nią przekazać wartość zmiennej
        // (w tym przypadku tablicy snippetNames)
        $.ajaxSetup({
            async: false
        });

        var snippetsNames = [];
        //czytanie jsona
        $.getJSON(snippets_url, function (data) {
            // Insert snippet from JSON file named "snippet_name"
            $.each(data['code_snippets'], function (key, snippet) {
                //snippetsNames.push(snippet['name']);
                snippetsNames.push({group:snippet['group'],name:snippet['name']});

            });
        });

        return snippetsNames;
    };

    //*** daje same grupy z obiektu "groups" JSON
    function get_SnippetsGroups(){
        //to wyłącza działanie asynchroniczne funkcji $getJSON i mozna wtedy poza nią przekazać wartość zmiennej
        // (w tym przypadku tablicy snippetNames)
        $.ajaxSetup({
            async: false
        });
        var snippetsGroups = {};
        //czytanie jsona
        $.getJSON(snippets_url, function (data) {
            snippetsGroups = data.groups;
        });
        return snippetsGroups;


    };

    //*** get Web Map Browser
    // zwraca tekst snippeta Web Map Browser
    //Do wstawienia w ukrytej celce zawierającej Web Map Browser
    function get_WebMapBrowserText() {
        //to wyłącza działanie asynchroniczne funkcji $getJSON i mozna wtedy poza nią przekazać wartość zmiennej
        // (w tym przypadku tablicy snippetNames)
        $.ajaxSetup({
            async: false
        });

        var snippet_name = "Web Map Browser";
        var WMBText = "";
        //czytanie jsona
        $.getJSON(snippets_url, function (data) {
            $.each(data['code_snippets'], function (key, snippet) {
                if (snippet['name'] == snippet_name) {
                    WMBText = snippet['code'].join('\n');
                }
                ;
            });
        });
        //WMBText = "12+99";
        return WMBText;
    };

    //*** createFile ***
    //tworzenie pliku tekstowego o nazwie untitled.txt
    function createFile(){
        // var contents = new contents_service.Contents({
        //     base_url: common_options.base_url,
        //     common_config: common_config
        // });

        var contents = new contents_service.Contents({
            base_url: base_url
        });

        contents.new_untitled('', {type: 'file', ext: '.txt'});
    };

    //*** save2 ***
    //Additional method added to Contents.prototyme class contained in Jupyter's "content.js" module
    //UWAGA:PUT (HTTP) nie jest obsługiwany przez wszystkie przeglądarki - może być, że nie zapiszemy snippetów - pomyśleć o PHP - ale najpierw testować
    //trzeba zrobić tak: każde dodanie snippeta wymaga pobrania całej zawartości pliku, modyfikacji i ponownego zapisu, z tego jak działa AJAX inaczej się nie da, chyba, że będziemy używać bazy danych...
    contents_service.Contents.prototype.save2 = function(path, model) {

        var settings = {
            processData : false,
            type : "PUT",
            dataType: "json",
            data : JSON.stringify(model),
            contentType: 'application/json',
        };
        var url = this.api_url(path);
        //the below is similar to $.ajax():
        return utils.promising_ajax(url, settings);
    };

    //** saveFile ***
    //Saves data into file located in user's HOME directory
    //if file doesn't exist, it will be created. Use carefully!
    function saveFile(fname,data){
        var contents = new contents_service.Contents({
            base_url: base_url
        });
        //contents.save('untitled.txt',{path:'',type:'file', format:'text', content:"{ x: 5, y: 6 }"});
        contents.save2(fname,{path:'',type:'file', format:'text', content:JSON.stringify(data)});
    };
    //todo: zabezpieczyć przed dodaniem snippeta do nieistniejącej grupy (numeru grupy) - niekoniecznie potrzebne, można to kontrolować z zewnątrz
    //*** addSnippet ***
    //Adds snippet to JSON file and to UI
    function addSnippet(codeSnippet){
        //to wyłącza działanie asynchroniczne funkcji $getJSON i mozna wtedy poza nią przekazać wartość zmiennej
        // (w tym przypadku tablicy snippetNames)
        $.ajaxSetup({
            async: false
        });

        var JSONdata = {};
        var toAdd = true;
        //czytanie jsona
        $.getJSON(snippets_url, function (data) {
            JSONdata = data;

            $.each(data['code_snippets'], function (key, snippet) {
                if (snippet['name'] == codeSnippet.name) {
                    alert('There is already a snippet with the name: "'+ codeSnippet.name +'". Please change.');
                    toAdd = false;
                };
            });
        });
        if (toAdd) {
            JSONdata.code_snippets.push(codeSnippet);
            saveFile(CODE_SNIPPETS_FN,JSONdata);
            addSnippetToUI(codeSnippet.group,codeSnippet.name);
            return JSONdata;
        }
        else return false;

    };

    //*** addSnippetToUI ***
    function addSnippetToUI(group_id,snippet_name){
        var id=group_id;
        var snippet_item = $('<div/>').addClass('menu_snippets_item');
        snippet_item.append($('<a/>',{href:'#'}).html(snippet_name).bind('click', {snippet_name: snippet_name},
            insert_cell1)) ;
        $('#'+id+'.menu_snippets_item_content').append(snippet_item);
    };

    //*** deleteSnippetFromUI
    //$( "#1.menu_snippets_item_content .menu_snippets_item" ).each(function(index){console.log($(this).text())})
    function deleteSnippetFromUI(group_id,snippet_name){
        $( '#'+group_id+'.menu_snippets_item_content .menu_snippets_item' ).each(
            function(index){
                if ($(this).text()==snippet_name){
                    $(this).remove();
                }
            });
    };

    //*** deleteSnippet ***
    //deletes snippet fom file and from UI
    function deleteSnippet(codeSnippet){
        //to wyłącza działanie asynchroniczne funkcji $getJSON i mozna wtedy poza nią przekazać wartość zmiennej
        // (w tym przypadku tablicy snippetNames)
        $.ajaxSetup({
            async: false
        });

        var JSONdata = {};
        var deleted = 0;
        var toDelete=[];
        var i;
        //czytanie jsona
        //get snippets to delete
        $.getJSON(snippets_url, function (data) {
            JSONdata = data;

            $.each(data['code_snippets'], function (key, snippet) {
                if (snippet['name'] == codeSnippet.name && snippet['group'] == codeSnippet.group) {
                    toDelete.push(snippet);
                };
            });
        });

        //delete snippets from JSONdata
        for (i = 0; i < toDelete.length; i++){
            JSONdata.code_snippets.splice(JSONdata.code_snippets.indexOf(toDelete[i]),1);
            deleted=deleted+1;
        };

        //save to file and UI
        if (deleted!=0){
            //JSONdata.code_snippets.push(codeSnippet);
            deleteSnippetFromUI(codeSnippet.group,codeSnippet.name);
            saveFile(CODE_SNIPPETS_FN,JSONdata);
            //addSnippetToUI(codeSnippet.group,codeSnippet.name);
            return JSONdata;
        };
        if (deleted==0) {
            alert('There is no snippet with the name: "'+ codeSnippet.name +'" in menu group number: '+codeSnippet.group);
            return false;
        };

    };

    //*** getMaxGroupId ***
    //do usunięcia
    function getMaxGroupId(){
        //to wyłącza działanie asynchroniczne funkcji $getJSON i mozna wtedy poza nią przekazać wartość zmiennej
        // (w tym przypadku tablicy snippetNames)
        $.ajaxSetup({
            async: false
        });
        var gids = [];
        $.getJSON(snippets_url, function (data) {
            $.each(data['groups'], function (key, groups) {
                gids.push(groups['group_id']);
                            });
        });
        return Math.max(...gids);
    };

    //*** make_snippets_menu_item ***
    var make_snippets_menu_item = function(element){

        var menu_snippets_item_header = $('<a/>',{href:'#',id:element.id}).addClass('menu_snippets_item_header').html(element.group_name).append($('<br>'));
        var menu_snippets_item_content = $('<div/>',{id:element.id}).addClass('menu_snippets_item_content');
        var item = {header:menu_snippets_item_header,content:menu_snippets_item_content};

        menu_snippets_item_header.click(function(){
            menu_snippets_item_content.slideToggle();
        });
        menu_snippets_item_content.hide();
        return item;
    };

    //*** addGroupToUI ***
    function addGroupToUI(gr_name,gr_id){
        var menu_snippets=$('.menu_snippets');
        var menu_item = make_snippets_menu_item({group_name:gr_name,id:gr_id});
        menu_snippets.append(menu_item.header).append(menu_item.content);
    };


    //*** addGroup ***
    //Adds menu snippets group to JSON file and to UI
    //{ group_id: 1, group_name: "OTB", group_level: 0 }
    function addGroup(group){
        //to wyłącza działanie asynchroniczne funkcji $getJSON i mozna wtedy poza nią przekazać wartość zmiennej
        // (w tym przypadku tablicy snippetNames)
        $.ajaxSetup({
            async: false
        });

        var JSONdata = {};
        var toAdd=true;
        var gids = [];
        var maxGid;
        //czytanie jsona
        $.getJSON(snippets_url, function (data) {
            JSONdata = data;

            $.each(data['groups'], function (key, groups) {
                if (groups['group_name'] == group.group_name) {
                    alert('There is already a group menu with the name: "'+ group.group_name +'". Please change.');
                    toAdd = false;
                };
                gids.push(groups['group_id']);
            });
        });
        if (toAdd) {
            //check max group ID, assign max+1 value to new group
            maxGid=Math.max(...gids)+1;
            group.group_id=maxGid;
            JSONdata.groups.push(group);
            //Save to JSON file
            saveFile(CODE_SNIPPETS_FN, JSONdata);
            //Add to interface
            //var menu_snippets=$('.menu_snippets');
            //var menu_item = make_snippets_menu_item({group_name:group.group_name,id:group.group_id});
            //menu_snippets.append(menu_item.header).append(menu_item.content);
            addGroupToUI(group.group_name,group.group_id);
            return JSONdata;
        }
        else return false;
    };


    // return public methods
    return {
        load_ipython_extension: load_extension,
        insert_snippet_cell: insert_cell1,
        getSnippetsList: get_SnippetsList,
        getSnippetsList1: get_SnippetsList1,
        getSnippetsGroups:get_SnippetsGroups,
        getWebMapBrowserText: get_WebMapBrowserText,
        createFile:createFile,
        saveFile:saveFile,
        addSnippet:addSnippet,
        addGroup:addGroup,
        getBaseUrl:getBaseUrl, //do usunięcia
        getSnippetsUrl:getSnippetsUrl, //do usunięcia
        getMaxGroupId:getMaxGroupId, //do usuniecia
        make_snippets_menu_item:make_snippets_menu_item,
        deleteSnippet:deleteSnippet

    };
});