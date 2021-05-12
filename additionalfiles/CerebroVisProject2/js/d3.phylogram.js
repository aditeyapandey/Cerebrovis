/**
 * Created by aditeyapandey on 11/16/17.
 */
/*
 d3.phylogram.js
 Wrapper around a d3-based phylogram (tree where branch lengths are scaled)
 Also includes a radial dendrogram visualization (branch lengths not scaled)
 along with some helper methods for building angled-branch trees.

 Copyright (c) 2013, Ken-ichi Ueda

 All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:

 Redistributions of source code must retain the above copyright notice, this
 list of conditions and the following disclaimer. Redistributions in binary
 form must reproduce the above copyright notice, this list of conditions and
 the following disclaimer in the documentation and/or other materials
 provided with the distribution.

 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 POSSIBILITY OF SUCH DAMAGE.

 DOCUEMENTATION

 d3.phylogram.build(selector, nodes, options)
 Creates a phylogram.
 Arguments:
 selector: selector of an element that will contain the SVG
 nodes: JS object of nodes
 Options:
 width
 Width of the vis, will attempt to set a default based on the width of
 the container.
 height
 Height of the vis, will attempt to set a default based on the height
 of the container.
 vis
 Pre-constructed d3 vis.
 tree
 Pre-constructed d3 tree layout.
 children
 Function for retrieving an array of children given a node. Default is
 to assume each node has an attribute called "branchset"
 diagonal
 Function that creates the d attribute for an svg:path. Defaults to a
 right-angle diagonal.
 skipTicks
 Skip the tick rule.
 skipBranchLengthScaling
 Make a dendrogram instead of a phylogram.

 d3.phylogram.buildRadial(selector, nodes, options)
 Creates a radial dendrogram.
 Options: same as build, but without diagonal, skipTicks, and
 skipBranchLengthScaling

 d3.phylogram.rightAngleDiagonal()
 Similar to d3.diagonal except it create an orthogonal crook instead of a
 smooth Bezier curve.

 d3.phylogram.radialRightAngleDiagonal()
 d3.phylogram.rightAngleDiagonal for radial layouts.
 */

if (!d3) { throw "d3 wasn't included!"};
(function() {
    var h=0
    var w=0
    d3.phylogram = {}
    d3.phylogram.rightAngleDiagonal = function() {
        var projection = function(d) { return [w-d.x, h-d.y]; }

        var path = function(pathData) {
            return "M" + pathData[0]  +' ' + pathData[1] + " " + pathData[2];
        }

        function diagonal(diagonalPath, i,height,width) {
            h=height
            w=width
            var source = diagonalPath.source,
                target = diagonalPath.target,
                midpointX = (source.x + target.x) / 2,
                midpointY = (source.y + target.y) / 2,
                pathData = [source, {x: target.x, y: source.y}, target];
            pathData = pathData.map(projection);
            return path(pathData)
        }

        diagonal.projection = function(x) {
            if (!arguments.length) return projection;
            projection = x;
            return diagonal;
        };

        diagonal.path = function(x) {
            if (!arguments.length) return path;
            path = x;
            return diagonal;
        };

        return diagonal;
    }

    d3.phylogram.radialRightAngleDiagonal = function() {
        return d3.phylogram.rightAngleDiagonal()
            .path(function(pathData) {
                var src = pathData[0],
                    mid = pathData[1],
                    dst = pathData[2],
                    radius = Math.sqrt(src[0]*src[0] + src[1]*src[1]),
                    srcAngle = d3.phylogram.coordinateToAngle(src, radius),
                    midAngle = d3.phylogram.coordinateToAngle(mid, radius),
                    clockwise = Math.abs(midAngle - srcAngle) > Math.PI ? midAngle <= srcAngle : midAngle > srcAngle,
                    rotation = 0,
                    largeArc = 0,
                    sweep = clockwise ? 0 : 1;
                return 'M' + src + ' ' +
                    "A" + [radius,radius] + ' ' + rotation + ' ' + largeArc+','+sweep + ' ' + mid +
                    'L' + dst;
            })
            .projection(function(d) {
                var r = d.y, a = (d.x - 90) / 180 * Math.PI;
                return [r * Math.cos(a), r * Math.sin(a)];
            })
    }

    // Convert XY and radius to angle of a circle centered at 0,0
    d3.phylogram.coordinateToAngle = function(coord, radius) {
        var wholeAngle = 2 * Math.PI,
            quarterAngle = wholeAngle / 4

        var coordQuad = coord[0] >= 0 ? (coord[1] >= 0 ? 1 : 2) : (coord[1] >= 0 ? 4 : 3),
            coordBaseAngle = Math.abs(Math.asin(coord[1] / radius))

        // Since this is just based on the angle of the right triangle formed
        // by the coordinate and the origin, each quad will have different
        // offsets
        switch (coordQuad) {
            case 1:
                coordAngle = quarterAngle - coordBaseAngle
                break
            case 2:
                coordAngle = quarterAngle + coordBaseAngle
                break
            case 3:
                coordAngle = 2*quarterAngle + quarterAngle - coordBaseAngle
                break
            case 4:
                coordAngle = 3*quarterAngle + coordBaseAngle
        }
        return coordAngle
    }

    d3.phylogram.styleTreeNodes = function(vis) {
        vis.selectAll('g.leaf.node')
            .append("svg:circle")
            .attr("r", 4.5)
            .attr('stroke',  'yellowGreen')
            .attr('fill', 'greenYellow')
            .attr('stroke-width', '2px');

        vis.selectAll('g.root.node')
            .append('svg:circle')
            .attr("r", 4.5)
            .attr('fill', 'steelblue')
            .attr('stroke', '#369')
            .attr('stroke-width', '2px');
    }

    function scaleBranchLengths(nodes, w) {
        // Visit all nodes and adjust y pos width distance metric
        var visitPreOrder = function(root, callback) {
            callback(root)
            if (root.children) {
                for (var i = root.children.length - 1; i >= 0; i--){
                    visitPreOrder(root.children[i], callback)
                };
            }
        }
        visitPreOrder(nodes[0], function(node) {
            node.rootDist = (node.parent ? node.parent.rootDist : 0) + (node.length || 0)
        })
        var rootDists = nodes.map(function(n) { return n.rootDist; });
        var yscale = d3.scale.linear()
            .domain([0, d3.max(rootDists)])
            .range([0, w]);
        visitPreOrder(nodes[0], function(node) {
            node.y = yscale(node.rootDist)
        })
        return yscale
    }


    d3.phylogram.build = function(selector, nodes,globalDataStructure,view, options) {
        var result=globalDataStructure.fetchData();
        options = options || {}
        var w = options.width || d3.select(selector).style('width') || d3.select(selector).attr('width'),
            h = options.height || d3.select(selector).style('height') || d3.select(selector).attr('height'),
            w = parseInt(w),
            h = parseInt(h);
        var tree = options.tree || d3.layout.cluster()
                .size([w, h])
                .sort(function(node) { return node.children ? node.children.length : -1; })
                .children(options.children || function(node) {
                        return node.branchset
                    });
        var diagonal = options.diagonal || d3.phylogram.rightAngleDiagonal();
        var vis = options.vis || d3.select(selector).append("svg:svg")
                .attr("width", w)
                .attr("height", h + 30)
                .attr("class","chartTree")
                .append("svg:g")
                .attr("transform", "translate(0, 20)");
        var nodes = tree(nodes);
        var color = d3.scaleOrdinal().domain([0, 2, 3, 4, 5, 6, 7]).range(['#1b9e77', '#d95f02', '#7570b3', '#e7298a', '#66a61e', '#e6ab02', '#a6761d'])
        //Radius scale

        //Radius scale
        radi=result.map(function(result){
            return result.radius
        })
        var radius= d3.scaleLog()
            .domain([d3.min(radi, function(d) { return d; }), d3.max(radi, function(d) { return d; })])
            .range([ 1, 8 ]);


        if (options.skipBranchLengthScaling) {
            var yscale = d3.scale.linear()
                .domain([0, h])
                .range([0, h]);
        } else {
            var yscale = scaleBranchLengths(nodes, h)
        }

        if (!options.skipTicks) {
            vis.selectAll('line')
                .data(yscale.ticks(10))
                .enter().append('svg:line')
                .attr('y1', 0)
                .attr('y2', h)
                .attr('x1', yscale)
                .attr('x2', yscale)
                .attr("stroke", "#ddd");

            vis.selectAll("text.rule")
                .data(yscale.ticks(10))
                .enter().append("svg:text")
                .attr("class", "rule")
                .attr("x", yscale)
                .attr("y", 0)
                .attr("dy", -3)
                .attr("text-anchor", "middle")
                .attr('font-size', '8px')
                .attr('fill', '#ccc')
                .text(function(d) { return Math.round(d*100) / 100; });
        }

        var link = vis.selectAll("path.link")
            .data(tree.links(nodes))
            .enter().append("svg:path")
            .attr("class", "link")
            .attr("d", function(d,i){
                return diagonal(d,i,h,w)})
            .attr("fill", "none")
            .attr("stroke", function(d){
                //console.log(d)
                if(view=="Normal") {

                    return colorSymmetry(d.source.type)
                  //This returns the blood flow encoding
                   // return colorEncodingForBloodFlow(d.source.bloodFlow,d.source.depth)
                    // if (d.source.bloodFlow == undefined) {
                    //     return '#1b9e77'
                    // }
                    // else {
                    //     return d3.interpolateRdYlBu((d.source.bloodFlow / (15000 / (Math.pow(2, (d.source.depth))))))
                    // }
                }
                else{
                    return colorSymmetry(d.source.type)
                //return color(d.source.type)
                    }
            })
            .attr("stroke-width", function(obj) {
                var d=obj.source

                if (d.childs == undefined) {
                    var segments = [0.5]
                }
                else {
                    var segments = d.childs
                }
                var radiusLengths = [];
                var radiusSum = 0

                segments.forEach(function(d){
                    if(result[d] == undefined){
                        radiusLengths.push(0.5)
                        radiusSum= radiusSum + 0.5
                    }
                    else{
                        radiusLengths.push(result[d].radius)
                        radiusSum= radiusSum + result[d].radius
                    }
                  })

                // if(d.=.childs == undefined){
                //     var segments=[0.5]
                // }
                // else{
                //     var segments=d.data.childs
                // }
                //
                // var radiusLengths=[];
                // var radiusSum=0
                // segments.forEach(function(d){
                //     if(result[d] == undefined){
                //         radiusLengths.push(0.5)
                //         radiusSum= radiusSum + 0.5
                //     }
                //     else{
                //         radiusLengths.push(result[d].radius)
                //         radiusSum= radiusSum + result[d].radius
                //     }
                return radius(radiusSum/radiusLengths.length)
            });

        // var node = vis.selectAll("g.node")
        //     .data(nodes)
        //     .enter().append("svg:g")
        //     .attr("class", function(n) {
        //         if (n.children) {
        //             if (n.depth == 0) {
        //                 return "root node"
        //             } else {
        //                 return "inner node"
        //             }
        //         } else {
        //             return "leaf node"
        //         }
        //     })
        //     .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })

        d3.phylogram.styleTreeNodes(vis)

        if (!options.skipLabels) {
            vis.selectAll('g.inner.node')
                .append("svg:text")
                .attr("dx", -6)
                .attr("dy", -6)
                .attr("text-anchor", 'end')
                .attr('font-size', '8px')
                .attr('fill', '#ccc')
                .text(function(d) { return d.length; });

            vis.selectAll('g.leaf.node').append("svg:text")
                .attr("dx", 8)
                .attr("dy", 3)
                .attr("text-anchor", "start")
                .attr('font-family', 'Helvetica Neue, Helvetica, sans-serif')
                .attr('font-size', '10px')
                .attr('fill', 'black')
                .text(function(d) { return d.name + ' ('+d.length+')'; });
        }

        return {tree: tree, vis: vis, nodes:nodes}
    }

}());