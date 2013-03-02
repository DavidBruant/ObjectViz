/**
 * Copyright (c) 2011 David Bruant
 * MIT Licence. (see LICENCE file at directory root)
 */

"use strict";

(function (global) {

    global.ObjectViz = function(o){
        var canvas;

        // need promises to move that up
        var container = document.getElementById("flowers");

        // Empty previous work
        container.innerHTML = '';
        
        if(typeof o !== "object" && typeof o !== "function") 
            throw new TypeError("What you want to visualize is not an object or a function. It's a "+ typeof o);
        
        while(o !== null){
            canvas = document.createElement('div');
            canvas.className = 'canvas';
            
            global.ObjectOwnViz(o, canvas);

            container.appendChild(canvas);
            o = Object.getPrototypeOf(o);
        }
    };
    
})(this); // modification
