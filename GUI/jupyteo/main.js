// file jupyteo/main.js
// By: Michał Bednarczyk
// Copyright (C) 2017-2019 .....
//
//  Distributed under the terms of the BSD License.
// ---------------------------------------------------------------------------
// Jupyteo Jupyter Extension main file.
//Main file
//TODO: place text messages and other resources in shared JS file (resources)

define([
        './jupyteo', //main Jupyteo object
        './menu',
        './toolbar_items',
        './panel_browser',
        './map_browser',
        './css_loader',
        './code_snippets'
    ],
    function (jupy,
              menu,
              toolbar_items,
              panel_browser,
              map_browser,
              css_loader,
              code_snippets
    ) {
        css_loader.load_jupyteo_theme();
        //css_loader.load_ipython_extension(); //this can be used to add button for loading style manually
        menu.load_ipython_extension();
        code_snippets.load_ipython_extension();
        toolbar_items.load_ipython_extension();
        panel_browser.load_ipython_extension();
    });