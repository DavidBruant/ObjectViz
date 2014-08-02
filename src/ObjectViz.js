"use strict";

(function (global) {

    var UNIT = 24, // Petal radius
        FLOWER_CONTAINER_SIZE = 400,
        FLOWER_CENTER_FACTOR = 2.2,
        FLOWER_CENTER_COLOR = '#CCC',
        COLORS = Object.freeze({
            'string':'#FFE565',
            'number':'#98FF65',
            'function':'#65FFB2',
            'object':'#65CBFF',
            'boolean':'#7F65FF',
            'null':'#FE65FF',
            'undefined':'#FF657F'
        });

    /*
        Petal
    */
    var Petal = React.createClass({
        render: function() {
            var pd = this.props.propDesc;
            var color = 'white';
            var text = this.props.name;
            
            if ("value" in pd) { // data descriptor
                color = pd.value === null ? COLORS['null'] : COLORS[typeof pd.value];

                if (['number', 'string', 'boolean'].indexOf(typeof pd.value) !== -1)
                    text += '\n' + (pd.value === '' ? '(empty string)' : pd.value);

                /*if (pd.writable)
                    petal.attr({'stroke':"none"});*/
            }


            /*if (!pd.configurable) { // looks like the property is bound to the object
                canvas.path("M" + x + " " + y + "L" + CANVAS_SIZE / 2 + " " + CANVAS_SIZE / 2).attr({stroke:FLOWER_CENTER_COLOR, fill:'none'});
                canvas.circle(x, y, UNIT / 5).attr({fill:FLOWER_CENTER_COLOR, stroke:'none'});
            }*/
            
            
            return (
                    
                React.DOM.circle({
                    fill: color,
                    stroke: "value" in pd ? "none" : "black",
                    'strokeWidth': "value" in pd ? "0" : '1px',

                    cx: this.props.position.x,
                    cy: this.props.position.y,
                    r: UNIT
                })
            );
        }
    });

    
    var PetalText = React.createClass({
        render: function() {
            var pd = this.props.propDesc;
            var text = this.props.name;
            
            var children = [  
                React.DOM.tspan({
                    'textAnchor': 'middle',
                    children: text
                })
            ];
            
            if ("value" in pd) { // data descriptor
                if (['number', 'string', 'boolean'].indexOf(typeof pd.value) !== -1)
                    children.push(React.DOM.tspan({
                        className: 'petal',
                        'textAnchor': 'middle',
                        x: this.props.position.x,
                        dy: '1.2em',
                        children: (pd.value === '' ? '(empty string)' : pd.value)
                    }))
            }
            
            return React.DOM.text({
                className: 'petal',
                children: children,
                x: this.props.position.x,
                y: this.props.position.y
            });
        }
    });
    
    /*
        Flower
    */
    function fillCircleWithPetals(x, y, radius, n, startAngle) {
        var angleUnit = 2 * Math.PI / n;
        var i;
        var angle = startAngle || 45;
        var ret = [];

        for (i = 0; i < n; i++) {
            ret.push({
                x: x + Math.cos(angle) * radius,
                y: y + Math.sin(angle) * radius
            });
            angle += angleUnit;
        }

        return ret;
    }


    function petalCenterPositions(nbPetals) {
        var ret = [];
        var currentCircleRadius = (FLOWER_CENTER_FACTOR + 1) * UNIT;
        var currentCirclePerimeter = 2 * Math.PI * currentCircleRadius;
        var fittablePetalsNumber = Math.floor(currentCirclePerimeter / (2 * UNIT));

        while (nbPetals > 0) {
            ret = ret.concat(fillCircleWithPetals(FLOWER_CONTAINER_SIZE / 2, FLOWER_CONTAINER_SIZE / 2, currentCircleRadius, Math.min(fittablePetalsNumber, nbPetals)));

            currentCircleRadius += 2 * UNIT;
            currentCirclePerimeter = 2 * Math.PI * currentCircleRadius;
            nbPetals -= fittablePetalsNumber;
            fittablePetalsNumber = Math.floor(currentCirclePerimeter / (2 * UNIT));
        }

        return ret;
    }

    var Flower = React.createClass({

        render: function() {
            var o = this.props.object;
            
            var names = Object.getOwnPropertyNames(o);
            var petalPositions = petalCenterPositions(names.length);
            
            return (
                React.DOM.div({
                    className: "flower",
                    children: React.DOM.svg({
                        width: FLOWER_CONTAINER_SIZE,
                        height: FLOWER_CONTAINER_SIZE,

                        children: [
                            React.DOM.circle({
                                className: 'center' + (Object.isExtensible(o) ? '' : ' non-extensible'),

                                cx: FLOWER_CONTAINER_SIZE / 2,
                                cy: FLOWER_CONTAINER_SIZE / 2,
                                r: (FLOWER_CENTER_FACTOR - 0.1) * UNIT
                            })
                        ].concat(names.map(function(name, i){
                            return Petal({
                                propDesc: Object.getOwnPropertyDescriptor(o, name),
                                position: petalPositions[i]
                            })
                        })).concat(names.map(function(name, i){ // after circles so they appear on top
                            return PetalText ({
                                name: name,
                                propDesc: Object.getOwnPropertyDescriptor(o, name),
                                position: petalPositions[i]
                            })
                        }))

                    })
                })
            );
        }
    });

    
    /*
        Bouquet
    */
    var Bouquet = React.createClass({
        render: function() {
            var o = this.props.object;

            var prototypeChain = [];

            while(o !== null){
                prototypeChain.push(o);
                o = Object.getPrototypeOf(o);
            }

            console.log('prototypeChain', prototypeChain);

            return (
                React.DOM.div({
                    className: "bouquet",
                    children: prototypeChain.map(function(o){
                        return Flower({object: o});
                    })
                })
            );
        }
    });


    global.ObjectViz = function ObjectViz(o){

        if(typeof o !== "object" && typeof o !== "function") 
            throw new TypeError("What you want to visualize is not an object or a function. It's a "+ typeof o);

        React.renderComponent(
            Bouquet({object: o}),
            document.body.querySelector('main')
        );

    };

})(this);
