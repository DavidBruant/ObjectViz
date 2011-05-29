/**
 * Copyright (c) 2011 David Bruant
 * MIT Licence. (see LICENCE file at directory root)
 */

"use strict";

(function(global){
    var UNIT = 25, // Petal radius
        CANVAS_SIZE = 400,
        FLOWER_CENTER_FACTOR = 2.2,
        COLORS = Object.freeze({'string'   : '#FFE565',
                                'number'   : '#98FF65',
                                'function' : '#65FFB2',
                                'object'   : '#65CBFF',
                                'boolean'  : '#7F65FF',
                                'null'     : '#FE65FF',
                                'undefined': '#FF657F'});
    
    
    function fillCircleWithPetals(x, y, radius, n, startAngle){
        var angleUnit = 2*Math.PI/n;
        var i;
        var angle = startAngle || 45;
        var ret = [];
    
        for(i=0 ; i<n ; i++){
            ret.push({x: x + Math.cos(angle)*radius,
                      y: y + Math.sin(angle)*radius});
            angle += angleUnit;
        }
        
        return ret;
    }
    
    
    function petalCenterPositions(nbPetals){
        var ret = [];
        var currentCircleRadius = (FLOWER_CENTER_FACTOR+1)*UNIT;
        var currentCirclePerimeter = 2*Math.PI*currentCircleRadius;
        var fittablePetalsNumber = Math.floor(currentCirclePerimeter/(2*UNIT));

        while(nbPetals > 0){
            ret = ret.concat( fillCircleWithPetals(CANVAS_SIZE/2, CANVAS_SIZE/2, currentCircleRadius, Math.min(fittablePetalsNumber, nbPetals)) );
        
            currentCircleRadius += 2*UNIT;
            currentCirclePerimeter = 2*Math.PI*currentCircleRadius;
            nbPetals -= fittablePetalsNumber;
            fittablePetalsNumber = Math.floor(currentCirclePerimeter/(2*UNIT));
        }        
        
        return ret;
    }
    
    
    global.ObjectOwnViz = function(o, container){
        var canvas = Raphael(container, CANVAS_SIZE, CANVAS_SIZE);
        
        // Flower center. It just looks prettier :-)
        canvas.circle(CANVAS_SIZE/2, CANVAS_SIZE/2, (FLOWER_CENTER_FACTOR-0.1)*UNIT).attr({'stroke':"none", fill:"#BBB"});
        // TODO add [[Extensible]] info

        var names = Object.getOwnPropertyNames(o);
        var petalPositions = petalCenterPositions(names.length);
        
        names.forEach(function(propName, i){
                          var pd = Object.getOwnPropertyDescriptor(o, propName);
                          var x = petalPositions[i].x;
                          var y = petalPositions[i].y;
                          var color;
                          
                          if("value" in pd){ // data descriptor
                              color = pd.value === null ? COLORS['null'] : COLORS[typeof pd.value];
                              canvas.circle(x, y, UNIT).attr({'stroke':"none", fill:color});
                              // TODO add enumerable, configurable, writable and value info
                          }
                          else{ // TODO accessor descriptor
                              canvas.circle(x, y, UNIT);
                          }
                          canvas.text(x, y, propName).attr({'font-size': 12});
                      });
    };    
})(window);  
