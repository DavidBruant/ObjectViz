/**
 * Copyright (c) 2011 David Bruant
 * MIT Licence. (see LICENCE file at directory root)
 */

"use strict";

(function(global){
    var UNIT = 24, // Petal radius
        CANVAS_SIZE = 400,
        FLOWER_CENTER_FACTOR = 2.2,
        FLOWER_CENTER_COLOR = '#CCC',
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
        var flowerCenter;
        
        flowerCenter = canvas.circle(CANVAS_SIZE/2, CANVAS_SIZE/2, (FLOWER_CENTER_FACTOR-0.1)*UNIT);
        
        if(Object.isExtensible(o))
            flowerCenter.attr({'stroke':"none", fill: "r"+FLOWER_CENTER_COLOR+":70%-#fff"});
        else
            flowerCenter.attr({'stroke':"1px", fill: FLOWER_CENTER_COLOR});

        var names = Object.getOwnPropertyNames(o);
        var petalPositions = petalCenterPositions(names.length);
        var texts = [];
        
        names.forEach(function(propName, i){
                          var pd = Object.getOwnPropertyDescriptor(o, propName);
                          var x = petalPositions[i].x, y = petalPositions[i].y;
                          var color;
                          var petal = canvas.circle(x, y, UNIT);
                          var text = propName;
                          
                          if("value" in pd){ // data descriptor
                              color = pd.value === null ? COLORS['null'] : COLORS[typeof pd.value];
                              petal.attr({fill:color});
                              
                              if(['number', 'string', 'boolean'].indexOf(typeof pd.value) !== -1)
                                  text += '\n' + (pd.value === ''?'(empty string)':pd.value);
                              
                              if(pd.writable)
                                  petal.attr({'stroke':"none"});
                              
                          }
                          else{ // TODO accessor descriptor
                              petal.attr({'stroke': "black", 'stroke-width':'1px'});
                          }
                          
                          if(!pd.enumerable) // looks like a ghost property
                              petal.attr({opacity: 0.25});
                              
                          if(!pd.configurable){ // looks like the property is bound to the object
                              canvas.path("M"+x+" "+y+"L"+CANVAS_SIZE/2+" "+CANVAS_SIZE/2).attr({stroke:FLOWER_CENTER_COLOR, fill:'none'});
                              canvas.circle(x, y, UNIT/5).attr({fill:FLOWER_CENTER_COLOR, stroke:'none'});
                          }
                          
                          // save texts to display them later on in order texts to appear on top of all petals
                          texts.push({x:x, y:y, text:text});
                      });
                      
        texts.forEach(function(e){
                          canvas.text(e.x, e.y, e.text).attr({'font-size': 12});
                      });
                      
    };    
})(window);  
