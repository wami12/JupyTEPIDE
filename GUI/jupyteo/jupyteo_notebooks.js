// File jupyteo/jupyteo_notebooks.js
// By: Michał Bednarczyk
// Copyright (C) 2017-2019 .....
//
//  Distributed under the terms of the BSD License.
// ---------------------------------------------------------------------------
// Notebooks list loading

define([
    'jquery',
    'base/js/namespace',
    'base/js/dialog',
    'base/js/utils',
    'services/config',
    'require',
    './content_access'
], function ($, Jupyter, dialog, utils, configmod, require, content_access) {
    "use strict";

    //daje listę nazw notebooków z pliku notebooks.json
    function get_NotebooksList() {
        //to wyłącza działanie asynchroniczne funkcji $getJSON i mozna wtedy poza nią przekazać wartość zmiennej

        $.ajaxSetup({
            async: false
        });

        var NotebooksList = [];
        //czytanie jsona
        //katalog z plikami json
        //var cfgPath = utils.url_path_join(Jupyter.notebook.base_url, 'tree/cfg');
        //konkretny plik json
        //var jsonFileName = "/notebooks.json";

        $.getJSON(require.toUrl('./notebooks.json'), function (data) {

            $.each(data['user_notebooks'], function (key, notebookName) {
                NotebooksList.push(notebookName['filename']);
            });
        });

        return NotebooksList;
    }

    //daje tablicę obiektów zbudowanych na podstawie plików zawartych w katalogu (path)
    //odfiltrowuje tylko pliki, które są notebookami oraz katalogami
    function get_NotebooksListDir(path) {
        //to wyłącza działanie asynchroniczne funkcji $getJSON i mozna wtedy poza nią przekazać wartość zmiennej

        $.ajaxSetup({
            async: false
        });

        var NotebooksList = content_access.getFilesList(path, {filter: "directory;notebook"});
        return NotebooksList;
    }

    // return public methods
    return {
        getNotebooksList: get_NotebooksList,
        get_NotebooksListDir: get_NotebooksListDir
    };

});