/*
 Visualizations are not adaptive to screen size, they will only look good on screen sizes more than 20 inches
 ToDo  : Make visualizations adaptive, Find a good way to represent labels
 Isolation mode : A mode where all the visualizations
 Bifurcations are not arteries, we should have arteries display
 make the pop out effect different for the currently clicked node
 Two way linking datastructures for visualization
 */
//Global Variables
let selectedSegments=[];

//ToDo: fix the borders of the main visualization
//ToDo: Persist the selection across brain view
//ToDo: The change should be supported by a gif which shows that processing is happening
//ToDo: Create a system diagram for CerevroVis
//ToDo: Smooth out each artery, i.e. when I look at the
//This is short term fix for projection, the real fix should go through the loop of setting global variables
let globalHighlightedSegment=[];

let opacity;
let arteryIndex;


//This variable store the id of all the terminating edges of all branches
let storeTerminationBranchIDs = {};
let timeout

//Function to draw the arteries
//Input: visualization div id, Artery data, arteryWidth,scaleFactor:ScaleFactor is 1 for the original brainview and it changes to 2 for cerebroVis, arteries indexed by Nodeid
//Returns: Null
//Renders: Path in the div that was passed
function drawBrainMap(globalData,viewSpec,visualizationId, inputArteryData, inputArteryWidth, scaleFactor, arteryStorageByIndex,stenosisArray = [], condtion)
{
    d3.select('#'+visualizationId).select(".chart").remove();

    const arteries = inputArteryData;
    const arteryWidth = inputArteryWidth;
    arteryIndex = arteryStorageByIndex;
    const treeData = globalData.fetchtreeData();

    var zCoord = Object.keys(arteryIndex).map(function(key) {
        return arteryIndex[key]['z'];
    });

    opacity = d3.scaleLinear()
        .domain([d3.min(zCoord), d3.max(zCoord)])
        .range([ 1, 0.2 ]);


    let bloodFlow = globalData.fetchBloodFlowSymmetry();
    let basilarBranchids = globalData.fetchBasilarBranchid();

    const leftPCA = globalData.fetchLeftPCA();
    const rightPCA = globalData.fetchRightPCA();


    const leftICChildNode = globalData.fetchLeftICChildNodes();
    console.log(stenosisArray);
    const rightICChildNodes = globalData.fetchRightICChildNodes();

    var margin = {top: 20, right: 20, bottom: 20, left: 20}
        , width = (1/scaleFactor) * $('#'+visualizationId).innerWidth() - margin.left - margin.right
        , height = (1/scaleFactor) * $('#'+visualizationId).innerWidth() - margin.top - margin.bottom;

    if(viewSpec.projectionType=="lateral") {
        var x = d3.scaleLinear()
            .domain([d3.min(arteries, function (d) {
                return d.x1;
            }), d3.max(arteries, function (d) {
                return d.x2
            })])
            .range([0, width]);
    }
    else{
        var x = d3.scaleLinear()
            .domain([d3.min(arteries, function (d) {
                return d.x1;
            }), d3.max(arteries, function (d) {
                return d.x2
            })])
            .range([width, 0]);
    }
    //Just by reversing the height with 0 can handle the top view of the brain projection
    if(viewSpec.projectionType=="top"){
        var y = d3.scaleLinear()
            .domain([d3.min(arteries, function(d) { return d.y1; }), d3.max(arteries, function(d) { return d.y1; })])
            .range([ 0, height ]);
    }
    else{
        var y = d3.scaleLinear()
            .domain([d3.min(arteries, function(d) { return d.y1; }), d3.max(arteries, function(d) { return d.y1; })])
            .range([ height, 0 ]);
    }


    radi=arteries.map(function(artery){
        return artery.radius
    });

    var minRadius= d3.min(radi, function(d) {return d;}) == 0 ? 0.3 : d3.min(radi, function(d) {return d; });

    var radius= d3.scalePow()
        .domain([minRadius, d3.max(radi, function(d) { return d; })])
        .range([ 1, 8 ])
        .exponent(0.6);



    var color=d3.scaleOrdinal().domain([0,2,3,4,5,6,7]).range(['#1b9e77','#d95f02','#7570b3','#e7298a','#66a61e','#e6ab02','#a6761d']);



    // Define the line
    var line = d3.line()
        .x(function(d) { return x(d[0]); })
        .y(function(d) { return y(d[1]); }).curve(d3.curveBasis);

    var chart = d3.select('#'+visualizationId)
        .append('svg:svg')
        .attr('width', width + margin.right + margin.left)
        .attr('height', height + margin.top + margin.bottom)
        .attr('class', 'chart');

    var main = chart.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        .attr('width', width)
        .attr('height', height)
        .attr('class', 'main');


    ////We are going to append paths one at a time and create an animation to view the transition
    let index=0;


    function drawArteries(index){
        data=[[arteries[index].x1,arteries[index].y1],[arteries[index].x2,arteries[index].y2]];
        path=main.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("class","C_"+arteries[index].nodeid)
            .attr("id","pathBM")
            //  .attr("stroke","steelblue")
            .attr("stroke", function(){
                if(bloodFlow) {
                    return colorEncodingForBloodFlow(arteries[index].bloodFlow , arteries[index].depth);
                    // if (arteries[index].bloodFlow == undefined) {
                    //     return '#1b9e77'
                    // }
                    // else {
                    //
                    //     return d3.interpolateRdYlBu(arteries[index].bloodFlow / (15000 / (Math.pow(2, arteries[index].depth))))
                    // }
                }
                else{

                    var PC1array=leftPCA.concat(rightPCA);
                    if(PC1array.indexOf(index)!=-1){
                        return colorSymmetry(8)
                    }
                    //return "red"
                    return colorSymmetry(arteries[index].type)
                }
                //return color(arteries[index].type)
            })

            .attr("stroke-width", function(){

                if(stenosisArray.indexOf(arteries[index].nodeid) != -1){
                    if(condtion=="stenosis"){
                        return 1;
                    }
                    else{
                        return 10;
                    }

                }
                else
                {
                    return radius(arteryWidth[arteries[index].nodeid]);
                }
            })
            // .attr("stroke-width", function(){return radius(0.5)})
            //  .attr("opacity", function(){
            //      return opacity( arteryIndex[arteries[index].nodeid]['z']);
            //  })
            .attr("d", line);

        // var totalLength = path.node().getTotalLength();
        //
        // // Set Properties of Dash Array and Dash Offset and initiate Transition
        // path
        //     // .attr("stroke-dasharray", totalLength + " " + totalLength)
        //     // .attr("stroke-dashoffset", totalLength)
        //     // .transition() // Call Transition Method
        //     // .duration(0) // Set Duration timing (ms)
        //     // .ease(d3.easeLinear) // Set Easing option
        //     // .attr("stroke-dashoffset", 0)
        //     .on("end", function(){
        //         index=index+1;
        //         if(index!=arteries.length){
        //             drawArteries(index)
        //         }
        //         else{
        //             //return "success"
        //         }
        //     });

    }

    //For loop draws the arteries one segment at a time
    for (let i=0;i < arteries.length; i++)
    {
        drawArteries(i);

    }


    //This code block colors the basilar branches in the projection to yellow
    let basilarBranchCoordsList=[];



    //This part needs to change when bloodflow is being shown
    if(!bloodFlow){
        basilarBranchids.forEach(function(d){
            //basilarBranchCoordsList.push([x(arteries[d].x1),y(arteries[d].y1)])
            d3.select(".C_"+d).attr("stroke","#d95f02").attr("opacity",1)
        });

    }





    // array = [[120,200],[120,260],[190,250],[190,300]]
    // // //Testing the Beizer Curve creation
    // main.append("path")
    //    .datum(array)
    //    .attr("class","secondaryPath")
    //    .attr("stroke","red")
    //    .attr("stroke-width",5)
    //    .attr("fill","none")
    //    .attr("d",d3.line()
    //        .x(function(d) { return d[0]; })
    //        .y(function(d) { return d[1]; }).curve(d3.curveBasis));

    //This if block checks if there is a segment highlighted and it will render based on the highlighted segment
    if(globalHighlightedSegment.length > 0){
        globalHighlightedSegment.forEach(function(d){
            highLightSegment(d)
        })
    }

}


//This function will draw labels on the brain map based on the view of the brain map
//Input: View/Projection
//Output: Placement of label
function drawLabelsBrainMap(view,visualizationId,color){

    //Define the labels per view.
    //The label should be ordered clockwise from the top (top , right , bottom, left)
    let back = {top:"S", right:"L", bottom: "I", left: "R" };
    let top = {top:"A", right:"L", bottom: "P", left: "R" };
    let lateral = {top:"S", right:"P", bottom: "I", left: "A" };

    color = "brickred";
    let projectionLabelStore = {back:back, top:top, lateral: lateral};

    //Whenever the function is called check i0.f the labels exists, if they do clear it
    d3.selectAll(".labelBrainMap").remove();

    //Draw new labels
    let margin = {top: 20, right: 20, bottom: 20, left: 20};
    d3.select('#'+visualizationId).select("svg").append("text").attr("class","labelBrainMap").text(projectionLabelStore[view]['top']).attr("x", ($('#'+visualizationId).innerWidth() - margin.left - margin.right)/2 ).attr("y",20).attr("font-family", "sans-serif").attr("font-size", "20px").style("fill", color);
    d3.select('#'+visualizationId).select("svg").append("text").attr("class","labelBrainMap").text(projectionLabelStore[view]['right']).attr("x", ($('#'+visualizationId).innerWidth() - margin.left - margin.right)+ margin.left ).attr("y",($('#'+visualizationId).innerWidth() - margin.left - margin.right)/2).attr("font-family", "sans-serif").attr("font-size", "20px").style("fill", color);
    d3.select('#'+visualizationId).select("svg").append("text").attr("class","labelBrainMap").text(projectionLabelStore[view]['bottom']).attr("x", ($('#'+visualizationId).innerWidth() - margin.left - margin.right)/2 ).attr("y",($('#'+visualizationId).innerWidth() - margin.left - margin.right)+ margin.left).attr("font-family", "sans-serif").attr("font-size", "20px").style("fill", color);
    d3.select('#'+visualizationId).select("svg").append("text").attr("class","labelBrainMap").text(projectionLabelStore[view]['left']).attr("x", 0).attr("y",($('#'+visualizationId).innerWidth() - margin.left - margin.right)/2).attr("font-family", "sans-serif").attr("font-size", "20px").style("fill", color);
}


function findSegmentsInnTree(nodes)
{

    if(nodes.data.childs != undefined){
        var segments=nodes.data.childs
        segments.forEach(function(d){
            selectedSegments.push(d)
        })
    }


}

function colorEncodingForBloodFlow(flow,depth)
{
    if (flow == undefined) {
        return d3.interpolateOrRd(1000)
    }
    else {
        if(flow==0){return "darkgrey"}
        else{
            return d3.interpolateOrRd(flow/1000)
        }

        //  return d3.interpolateRdYlBu(flow / (15000 / (Math.pow(2,depth))))
    }

}

// marking of the arteries
// 0=Basilar
// 2=RACA
// 3=RMCA
// 4=LMCA
// 5=LACA
// 6=RPCA
// 7=LPCA

function colorSymmetry(type)
{

    //var color = d3.scaleOrdinal().domain([0, 2, 3, 4, 5, 6, 7]).range(['lightcoral', 'darkblue', '#B22222', 'lightseagreen', 'slateblue', 'gold', 'forestgreen'])
    var color = d3.scaleOrdinal().domain([0, 2, 3, 4, 5, 6, 7,8,9]).range(['#7570b3', '#bf812d', '#8c510a', '#01665e', '#35978f', '#dfc27d', '#80cdc1','#B22222', '#d95f02' ])
    return color(type)

    //'#1b9e77', '#d95f02', '#7570b3', '#e7298a', '#66a61e', '#e6ab02', '#a6761d'
    //'lightcoral', 'darkblue', 'firebrickred', 'lightseagreen', 'slateblue', 'gold', 'forestgreen'
}


//Original drawDengrogram Function with commented out section for drawing template
function drawDendrogram(globalDataStructure,view, stenosisArray = [],condition) {

    // annotate();

    d3.select(".chartTree").remove();


    var treeData=globalDataStructure.fetchtreeData();
    var treeData1=globalDataStructure.fetchtreeData();
    var result=globalDataStructure.fetchData();
    var arteryLabels=globalDataStructure.fetchArteryLabels();
    var bloodFlow=globalDataStructure.fetchBloodFlowSymmetry();
    var hybridTreeData=globalDataStructure.fetchHybridData();
    var arterylabelToPass=jQuery.extend(true, {}, arteryLabels);
    var treeData2=globalDataStructure.fetchBasilar();

    const arteryIndex = globalDataStructure.fetchArteryStorageByIndex();
    console.log(arteryIndex);

    var globalTempStrokeWidth=-1;
    var valueofMaxRadius;

    var temptree=treeData1;

// set the dimensions and margins of the diagram
    var margin = {top: 20, right: 90, bottom: 250, left: 90},
        width = $('#dendrogram').innerWidth() - margin.left - margin.right,
        height = (3/4)*($('#dendrogram').innerWidth()) - margin.top - margin.bottom;


// declares a tree layout and assigns the size
    var treemap = d3.tree()
        .size([width, height]);

    var treemap2=d3.tree().size([width/4,height/5]);

    var nodes={};

    //This var stores the temporary data to make an independent tree, an independent tree will be used later to visualize the two branches coming out of basilar arteries
    var nodes1={};


    nodes = d3.hierarchy(treeData);

    console.log(nodes);

    // This step computes the stats and displays it on the console
    // calculateStats( nodes.children[0].children[0],"LeftMCA");
    // calculateStats( nodes.children[3].children[1],"RightMCA");
    //
    // calculateStats( nodes.children[0].children[1],"LeftACA");
    // calculateStats( nodes.children[3].children[0],"RightACA");
    //
    // calculateStats( nodes.children[1],"LeftPCA");
    // calculateStats( nodes.children[2],"RightPCA");
    //
    // consoleStats(nodes.children[0].children[0], nodes.children[0].children[1],  nodes.children[1], nodes.children[3].children[1], nodes.children[3].children[0] ,nodes.children[2]);


    //This step sorts two branches based on the distance from the parent. The idea is to make the inner branch closer to the circle of willis.
    //The current technique just compares the distance from

    //Children [0] and Children [1] are names for the ACA and MCA

    nodes.children[0].children[0].sort(function(a, b)
    {
        return coordinatesDefintion(arteryIndex,a,b,nodes.children[0].children[0])
    });

    nodes.children[0].children[1].sort(function(a, b)
    {
        return coordinatesDefintion(arteryIndex,a,b,nodes.children[0].children[1])
    });

    //Children [1] is for one of the
    nodes.children[1].sort(function(a, b)
    {
        return coordinatesDefintion(arteryIndex,a,b,nodes.children[1].children[0])
    });

    //Children [2] is for the second PCA
    nodes.children[2].sort(function(a, b)
    {
        return coordinatesDefintion(arteryIndex,a,b,nodes.children[2].children[0])
    });

    //Children [0] and Children [1] are names for the ACA and MCA
    nodes.children[3].children[0].sort(function(a, b)
    {
        return coordinatesDefintion(arteryIndex,a,b, nodes.children[3].children[0])

    });
    nodes.children[3].children[1].sort(function(a, b)
    {
        return coordinatesDefintion(arteryIndex,a,b, nodes.children[3].children[1])

    });

    //Data creation for TPath following task
    storeTerminatingBranchIds(nodes.children[0].children[0],nodes.children[0].children[1],nodes.children[1],nodes.children[2],nodes.children[3].children[0],(nodes.children[3].children[1]))

//Color scale
    var color = d3.scaleOrdinal().domain([0, 2, 3, 4, 5, 6, 7]).range(['#1b9e77', 'plum', '#7570b3', '#e7298a', '#66a61e', '#e6ab02', '#a6761d']);



//Width of arteries
    radi=result.map(function(result){
        return result.radius
    })

    var minRadius= d3.min(radi, function(d) {return d; }) == 0 ? 0.3 : d3.min(radi, function(d) {return d; });

    var radius= d3.scaleLog().domain([minRadius, (valueofMaxRadius = d3.max(radi, function(d) { return d; }))]).range([ 1, 11 ]);

    //
    // var radius= d3.scalePow()
    //     .domain([minRadius, d3.max(radi, function(d) { return d; })])
    //     .range([ 1, 20 ])
    //     .exponent(0.6);

    //Assiging max radius to the variable to give user equal ability to select each artery
    valueofMaxRadius=radius(valueofMaxRadius);


// End Width of the arteries

// Creating a toggle variable to control toggling of branches
    var toggleBranches=false;
    var toggleSegment=false;

// Toggle ends here

    // append the svg obgect to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    var svg = d3.select("#dendrogram").append("svg").attr("class","chartTree").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom)

    g1= svg.append("g")

    g = svg.append("g").attr("transform","translate(" + margin.left + "," + margin.top + ")").style("fill","none");


    var mainNodes=nodes;
    console.log(nodes)

    //Sending desencdants data to the cerebrovis drawing technique
    let nodesInFn= treemap(nodes)
    if(nodesInFn.descendants().length==1)
    {
        var descendants = nodesInFn.descendants();
    }
    else
    {
        var descendants = nodesInFn.descendants().slice(1);
    }

    treemapVis(descendants);

    function treemapVis(descendants) {

        g.append("path").attr("id","anteriorComm")

        var link = g.selectAll(".linkForeGround")
            .data(descendants, function(d) {
                return d.data.name; });

        //enter
        link
            .enter().append("path")
            .attr("class", "linkForeGround")
            .attr("id",function(d){
                return "linkFG"+d.data.childs.reduce(function(a,b){return a+b})
            })
            .attr("d", function (d) {
                return "M" + d.x + "," + (height - d.y)
                    + "C" + d.x + "," + ((height - d.y) + (height - d.parent.y)) / 2
                    + " " + d.parent.x + "," + ((height - d.y) + (height - d.parent.y)) / 2
                    + " " + d.parent.x + "," + (height - d.parent.y);
            })
            .attr("stroke", function (d) {

                if(d.data.name==1000)
                {
                    return "#333"
                }

                //Color scale for blood flow
                if(bloodFlow) {
                    return colorEncodingForBloodFlow(d.data.bloodFlow,d.depth)
                    // if (d.data.bloodFlow == undefined) {
                    //     return '#1b9e77'
                    // }
                    // else {
                    //     return d3.interpolateRdYlBu(d.data.bloodFlow / (15000 / (Math.pow(2, d.depth))))
                    // }
                }
                else{
                    //  return "gray";
                    return colorSymmetry(d.data.type)



                    // return color(d.data.type)
                }

            })
            .attr("opacity",function(d,i){
                if(i==0 || i==3){
                    return 0;
                }
                else{
                    // console.log(opacity( arteryIndex[d.data.name]['nodeid']))
                    // console.log(arteryIndex[d.data.name]['nodeid'])
                    // return opacity( arteryIndex[d.data.name]['z']);

                    return 1;
                }
            })
            .attr("stroke-width", function(d){
                if(d.data.childs.equals(stenosisArray)){
                    if(condition=="stenosis"){
                        return 1;
                    }
                    else{
                        return 10;
                    }

                }
                return radius(d.data.radius);
            })
            // .style("fill","url(#diagonal-stripe-5)")
            .on("click", function (d) {

                d3.selectAll(".linkForeGround").style("stroke", "darkgray");
                d3.select(this).attr("class","linkFGC").style("stroke", "");
                globalHighlightedSegment.push(d);
                highLightSegment(d);
                // stenosisTask(d,d.parent,d.children);
                //therapeuticPlanning(d,d,globalDataStructure);

            })
            .on("dblclick", function (d) {
                globalHighlightedSegment=[];
                d3.selectAll(".linkForeGround").style("stroke", "");
                d3.selectAll(".linkFGC").attr("class","linkForeGround").style("stroke", "");
                d3.selectAll("#pathBM").style("stroke", "").style("opacity","1");
                d3.selectAll("#pathBMC").attr("id","pathBM").style("stroke", "");


            })
            .on("mouseover", function (d) {
                //Store the stroke width in a global variable
                globalTempStrokeWidth = d3.select(this).attr("stroke-width");
                //console.log(Math.log(globalTempStrokeWidth))
                //Magnify the stroke width
                d3.select(this).attr("stroke-width", valueofMaxRadius-2);

            })
            .on("mouseout", function (d) {

                //bring the stroke width to normal
                d3.select(this).attr("stroke-width", globalTempStrokeWidth);
                //unset the value in global value
                globalTempStrokeWidth=-1

            });

        // update
        link.attr('d', function (d) {
            return "M" + d.x + "," + (height - d.y)
                + "C" + d.x + "," + ((height - d.y) + (height - d.parent.y)) / 2
                + " " + d.parent.x + "," + ((height - d.y) + (height - d.parent.y)) / 2
                + " " + d.parent.x + "," + (height - d.parent.y);
        })
        // exit
        link.exit().remove();

        //This function creates the base template
        templateDrawing(g,globalDataStructure)
    }

    function project(x, y) {
        var angle = (x - 90) / 180 * Math.PI, radius = y;
        return [radius * Math.cos(angle), radius * Math.sin(angle)];
    }

//Todo: The template layout needs to be fixed!
    function templateDrawing(g,globalDataStructure)
    {

        //First define the maximum height of the template : max height of the template is 1/4 of the main node
        let element = g.node();
        let templateHeight = element.getBoundingClientRect().width/5;

        var leftICChildNodes=globalDataStructure.fetchLeftICChildNodes();
        var rightICChildNodes=globalDataStructure.fetchRightICChildNodes();
        var leftPCA=globalDataStructure.fetchLeftPCA();
        var rightPCA=globalDataStructure.fetchRightPCA();
        let basilarBranchids = globalDataStructure.fetchBasilarBranchid();

        let bloodFlow=globalDataStructure.fetchBloodFlowSymmetry()


        //Template drawing
        var withMxycordsofLeftCart1;
        var secondxycordsofLeftCart1;
        var withMxycordsofRightCart2;
        var secondxycordsofLeftCart2;
        var basilarCoordinates;
        var connectingArtery1x;
        var connectingaretry1terminal;
        var connectingArtery2x;
        var startCoordsX;
        var startCoordsY;
        var startCoordsXC2;
        var startCoordsYC2;

        //Connecting arteries coordinates
        var connecting1terminalx
        var connecting1terminaly
        var connecting2terminalx
        var connecting2terminaly

        d3.selectAll(".linkForeGround").each( function(d, i){
            if(i==0){
                path=d3.select(this).attr("d")
                withMxycordsofLeftCart1=path.split(",")[0]
                connectingArtery1x=withMxycordsofLeftCart1.split("M")[1]
                secondxycordsofLeftCart1=parseFloat(path.split(",")[1].split("C")[0])
            }
            if(i==2){
                path=d3.select(this).attr("d")
                terminatingCoords=path.split(",")[3]
                reverseCoordinates = terminatingCoords.split(" ")[1]+","+(parseFloat(terminatingCoords.split(" ")[0])+20)
                connectingaretry1terminal=[terminatingCoords.split(" ")[1],(parseFloat(terminatingCoords.split(" ")[0])+20)]
                basilarCoordinates=reverseCoordinates

                //Finding the coordinates for connecting artery2 terminal
                startCoords=path.split(",")[0]
                connecting2terminalx=startCoords.split("M")[1]
                startCoords=path.split(",")[1]
                connecting2terminaly=startCoords.split("C")[0]

            }
            if(i==3){
                path=d3.select(this).attr("d")
                withMxycordsofRightCart2=path.split(",")[0]
                connectingArtery2x=withMxycordsofRightCart2.split("M")[1]
                secondxycordsofLeftCart2=parseFloat(path.split(",")[1].split("C")[0])
            }
            if(i==1){
                path=d3.select(this).attr("d");
                startCoords=path.split(",")[0];
                connecting1terminalx=startCoords.split("M")[1];
                startCoords=path.split(",")[1];
                connecting1terminaly=startCoords.split("C")[0]

            }
            if(i==5){
                path=d3.select(this).attr("d");
                startCoords=path.split(",")[0];
                startCoordsX=startCoords.split("M")[1];
                startCoords=path.split(",")[1];
                startCoordsY=startCoords.split("C")[0]
            }
            if(i==10){
                path=d3.select(this).attr("d");
                startCoords=path.split(",")[0];
                startCoordsXC2=startCoords.split("M")[1];
                startCoords=path.split(",")[1];
                startCoordsYC2=startCoords.split("C")[0];
            }
        })

        var leftCarotid=withMxycordsofLeftCart1+","+secondxycordsofLeftCart1+"c11.495818421500019,15.117791044599983,11.495818421500019,60.8507758499,0,75.96856689449999s-83.22354855109998,-18.58939262529998,-99.9038848877,0s-17.279047696799978,69.47990214379999,-1.040664672799977,88.45657348630004"
        var rightCarotid=withMxycordsofRightCart2+","+secondxycordsofLeftCart2+"c-13.17512037710003,15.149351535500017,-12.521224094900163,65.49921218819998,1.042877197199914,80.30130004879999s74.78071809649998,-18.222273784199956,90.7300415039,-2.085754394499986s17.22943143340001,68.62079861579996,2.0857543946000305,85.5156860352"
        var basilar="M"+basilarCoordinates+"a267.3130186639,267.3130186639,0,0,1,-1.0406654344000117,112.39186691309996"
        //var c1artery=withMxycordsofLeftCart1+","+secondxycordsofLeftCart1+"c283.8059692792,554.8059692792 533,597 533,497"

        var c1artery="M"+connectingArtery1x+","+secondxycordsofLeftCart1+"C"+connectingArtery1x+","+(secondxycordsofLeftCart1+50)+" "+connecting1terminalx+","+(parseFloat(connecting1terminaly)+30) +" "+connecting1terminalx+","+(connecting1terminaly)
        var c2artery="M"+connectingArtery2x+","+secondxycordsofLeftCart2+"C"+connectingArtery2x+","+(secondxycordsofLeftCart2+50)+" "+connecting2terminalx+","+(parseFloat(connecting2terminaly)+30) +" "+connecting2terminalx+","+(connecting2terminaly)
        var anteriorCommunicatingArtery

        var anteriorCommunicatingArtery="M"+startCoordsX+","+startCoordsY+"C"+startCoordsX+","+(startCoordsY-20)+" "+startCoordsXC2+","+(startCoordsYC2-20)+" "+startCoordsXC2+","+startCoordsYC2



        g.append("path").attr("class", "linkForeGround")
            .attr("id",function(d){return "linkFG"+basilarBranchids.reduce(function(a,b){return a+b})})
            .attr("d",basilar)
            .attr("stroke",function(d){
                if(bloodFlow){
                    return "rgb(127, 0, 0)"
                }
                else{
                    return colorSymmetry(9)
                }
            })
            .attr("stroke-width", 10).attr("fill", "none")


        g.append("path").attr("class", "linkForeGround")
            .attr("id","linkFG")
            .attr("d",c1artery)
            .attr("stroke",function(d){
                if(bloodFlow){
                    return "rgb(127, 0, 0)"
                }
                else{
                    return colorSymmetry(8);
                }
            })
            .attr("stroke-width", 5).attr("fill", "none").on("click",function(){
            console.log("left PCA")
            var d={}
            d.data={}
            d.data.childs=rightPCA
            //d.data.childs=[148, 149, 150, 151, 152, 153, 154, 155, 156]
            d3.selectAll(".linkForeGround").style("stroke", "darkgray");
            // d3.select(this).attr("id","linkFGC").style("stroke", "");
            d3.select(this).attr("class","linkFGC").style("stroke", "");
            highLightSegment(d)
        })
            .on("dblclick", function (d) {
                d3.selectAll(".linkForeGround").style("stroke", "");
                d3.selectAll(".linkFGC").attr("class","linkForeGround").style("stroke", "");
                d3.selectAll("#pathBM").style("stroke", "").style("opacity","1");;
                d3.selectAll("#pathBMC").attr("id","pathBM").style("stroke", "")

            });

        g.append("path").attr("class", "linkForeGround")
            .attr("id","linkFG").attr("d",c2artery)
            .attr("stroke",function(d){
                if(bloodFlow){
                    return "rgb(127, 0, 0)"
                }
                else{
                    return colorSymmetry(8);
                }
            })
            .attr("stroke-width", 5).attr("fill", "none")
            .on("click",function(){
                var d={}
                d.data={}
                d.data.childs=leftPCA
                // d.data.childs=[  38, 39, 40, 41, 42, 43, 44]
                d3.selectAll(".linkForeGround").style("stroke", "darkgray");
                // d3.select(this).attr("id","linkFGC").style("stroke", "");
                d3.select(this).attr("class","linkFGC").style("stroke", "");
                highLightSegment(d)
            })
            .on("dblclick", function (d) {
                d3.selectAll(".linkForeGround").style("stroke", "");
                d3.selectAll(".linkFGC").attr("class","linkForeGround").style("stroke", "");
                d3.selectAll("#pathBM").style("stroke", "").style("opacity","1");
                d3.selectAll("#pathBMC").attr("id","pathBM").style("stroke", "");

            });

        d3.select("#anteriorComm").attr("d",anteriorCommunicatingArtery).attr("stroke","silver").attr("stroke-width", 5).attr("fill", "none").style("opacity","0.7").style("stroke-dasharray","2px")


        //Code for the creation of carotids
        array = findAnchorPointsForCOW(leftICChildNodes.length,"left",[parseFloat(connectingArtery1x),secondxycordsofLeftCart1],templateHeight)
        console.log(array)
        // //Testing the Beizer Curve creation
        g.append("path")
            .datum(array)
            .attr("class", "linkForeGround")
            .attr("id",function(d){return "linkFG"+rightICChildNodes.reduce(function(a,b){return a+b})})
            .attr("stroke",function(d){
                if(bloodFlow){
                    return "rgb(127, 0, 0)"
                }
                else{
                    return colorSymmetry(0)
                }
            })
            .attr("stroke-width",10)
            .attr("fill","none")
            .attr("d",d3.line()
                .x(function(d) { return d[0]; })
                .y(function(d) { return d[1]; }).curve(d3.curveBasis))
            .on("click",function(){
                var d={};
                d.data={};
                d.data.childs=rightICChildNodes;
                d3.selectAll(".linkForeGround").style("stroke", "darkgray");
                d3.select(this).attr("class","linkFGC").style("stroke", "");
                highLightSegment(d)
            })
            .on("dblclick", function (d) {
                d3.selectAll(".linkForeGround").style("stroke", "");
                d3.selectAll(".linkFGC").attr("class","linkForeGround").style("stroke", "");
                d3.selectAll("#pathBM").style("stroke", "").style("opacity","1");;
                d3.selectAll("#pathBMC").attr("id","pathBM").style("stroke", "");
            });


        array = findAnchorPointsForCOW(leftICChildNodes.length,"right",[parseFloat(connectingArtery2x),secondxycordsofLeftCart2],templateHeight)
        console.log(array);
        // //Testing the Beizer Curve creation
        g.append("path")
            .datum(array)
            .attr("class", "linkForeGround")
            .attr("id",function(d){return "linkFG"+leftICChildNodes.reduce(function(a,b){return a+b})})
            .attr("stroke",function(d){
                if(bloodFlow){
                    return "rgb(127, 0, 0)"
                }
                else{
                    return colorSymmetry(0)
                }
            })
            .attr("stroke-width",10)
            .attr("fill","none")
            .attr("d",d3.line()
                .x(function(d) { return d[0]; })
                .y(function(d) { return d[1]; }).curve(d3.curveBasis))
            .on("click",function(){
                var d={};
                d.data={};
                d.data.childs=leftICChildNodes;
                d3.selectAll(".linkForeGround").style("stroke", "darkgray");
                d3.select(this).attr("class","linkFGC").style("stroke", "");
                highLightSegment(d)
            })
            .on("dblclick", function (d) {
                d3.selectAll(".linkForeGround").style("stroke", "");
                d3.selectAll(".linkFGC").attr("class","linkForeGround").style("stroke", "");
                d3.selectAll("#pathBM").style("stroke", "").style("opacity","1");;
                d3.selectAll("#pathBMC").attr("id","pathBM").style("stroke", "");
            });

    }

    function selectAllChild(d){
        if(!toggleBranches)
        {
            treemapVis(d)
            //drawBrainMap(globalDataStructure)
            toggleBranches=true
        }
        else
        {
            treemapVis(nodes)
            //drawBrainMap(globalDataStructure)

            toggleBranches=false
        }
    }


    function selectBrainBranchesByType(type1,type2){

        var  tempNodes = treemap(mainNodes);
        desc=tempNodes.descendants();
        var allchilds=[]
        desc.forEach(function(d){
            if(d.data.type != undefined){
                if(d.data.type==type1 || d.data.type==type2){
                    childs=d.data.childs
                    childs.forEach(function(d){
                        allchilds.push(d)
                    })
                }
            }
        })


        d3.selectAll("#pathBM").style("stroke", "darkgray");
        allchilds.forEach(function (d) {
            d3.select(".C_"+d).attr("id","pathBMC").style("stroke", "")

        })
    }

    function unselectBrainBranchesbyType()
    {
        d3.selectAll("#pathBM").style("stroke", "");
        d3.selectAll("#pathBMC").attr("id","pathBM").style("stroke", "");
    }

    function createTree(type,arteryLabels)
    {
        var selectedBranches=[];

        if(type==3 || type ==4)
        {
            selectedBranches.push('LPCA');
            selectedBranches.push('RPCA');
            selectBrainBranchesByType(3,4);
        }
        else if(type==7 || type==6){
            selectedBranches.push('LMCA');
            selectedBranches.push('RMCA');
            selectBrainBranchesByType(7,6);

        }
        else{
            selectedBranches.push('LACA');
            selectedBranches.push('RACA');
            selectBrainBranchesByType(2,5)

        }

        if(!toggleBranches)
        {
            var treeData1 = {name: "Test", children: [arteryLabels[selectedBranches[0]], arteryLabels[selectedBranches[1]]]}
            var nodes1 = d3.hierarchy(treeData1);
            var nodes = treemap(nodes1);
            toggleBranches=true;
            return nodes
        }
        else
        {
            toggleBranches=false;
            unselectBrainBranchesbyType();
            return mainNodes
        }

    }

}

function highLightSegment(d,color = null)
{
    d3.selectAll("#pathBM").style("stroke", "darkgray").style("opacity","0.5");
    segmentComponents=d.data.childs;
    segmentComponents.forEach(function (d) {
        if(color){
            d3.select(".C_"+d).attr("id","pathBMC").style("stroke", color).style("opacity","1");
        }
        else{
            d3.select(".C_"+d).attr("id","pathBMC").style("stroke", "").style("opacity","1");
        }
    })
}

function unHighLightSegment(d) {
    segmentComponents=d.data.childs;
    segmentComponents.forEach(function (d)
    {
        d3.select(".C_"+d).style("stroke", "").style("opacity","1");
    })
}


function  coordinatesDefintion(arteryIndex,a,b,gp)
{
    let adist = distance(arteryIndex[gp.parent.data.name]['averageXYZ'][0],arteryIndex[a.data.childs[0]]['averageXYZ'][0],arteryIndex[gp.parent.data.name]['averageXYZ'][1],arteryIndex[a.data.childs[0]]['averageXYZ'][1])
    let bdist = distance(arteryIndex[gp.parent.data.name]['averageXYZ'][0],arteryIndex[b.data.childs[0]]['averageXYZ'][0],arteryIndex[gp.parent.data.name]['averageXYZ'][1],arteryIndex[b.data.childs[0]]['averageXYZ'][1])
    return bdist - adist
}


//This function computes the euclidean distance between a two dimensional data point
function distance(x1,x2,y1,y2)
{
    let a = x1 - x2;
    let b = y1 - y2;
    return Math.sqrt( a*a + b*b );
}


//Description: Returns the anchor points for the circle of willis branches
//Input: the length of the segment, direction of the IC, starting point of the IC, template height
//Output: Coordinates to draw a path
function findAnchorPointsForCOW(input, direction, startPoint,height)
{
    //console.log("test log")
    // Divison by 50 is based on the number of segments in the data\
    // The max segments in the carotids are around 50, if they go above 50 then they need to be adjusted in the algorithm

    let scale = (val) => {return val*(height/(input+Math.floor(input/2)))};
    let arrayCoordinateList = [];


    //Figure out the direction
    //If Left use a different set of calculation
    if(direction=="left" )
    {
        //This part will be executed always
        let height25 = scale(input);
        let x = startPoint[0];
        let y = startPoint[1];
        arrayCoordinateList = [[x,y],[x,y+height25/2],[x,y+height25]];


        //This part will execute when the length of the array is more than 25 but less than 35
        let x35;
        if(input>25)
        {
            let height35 = scale(input-10);
            arrayCoordinateList.push([x-height35,y+height25+10]); // The 10 here is a static number which needs to be a factor of the screen size
            x35  = x-height35;
        }

        if(input>37)
        {
            let height50 = scale(input-15);
            arrayCoordinateList.push([x35,y+height25+10+height50]);
        }

    }
    else
    {
        //This part will be executed always
        let height25 = scale(input);
        let x = startPoint[0];
        let y = startPoint[1];
        arrayCoordinateList = [[x,y],[x,y+height25/2],[x,y+height25]];


        //This part will execute when the length of the array is more than 25 but less than 35
        let x35;
        if(input>25)
        {
            let height35 = scale(input-10);
            arrayCoordinateList.push([x+height35,y+height25+10]); // The 10 here is a static number which needs to be a factor of the screen size
            x35  = x+height35;
        }

        if(input>37)
        {
            let height50 = scale(input-15);
            arrayCoordinateList.push([x35,y+height25+10+height50]);
        }

    }

    //Else use a different set of calculation

    return arrayCoordinateList
}


//Function: Displaying stats about the tree subparts
//Input: tree data, label
//Output: present the data to represent
function  calculateStats(data, label)
{

    console.log( label+": " +  (data.descendants().length - data.leaves().length) );
    console.log( label+" Height: " +  data.height );
    console.log( label+" B/L: " +  ((data.descendants().length- data.leaves().length) /data.leaves().length) );
}

function consoleStats(lmca,laca,lpca,rmca,raca,rpca)
{
    console.log([(lmca.descendants().length - lmca.leaves().length),((laca.descendants().length - laca.leaves().length)),(lpca.descendants().length - lpca.leaves().length),(rmca.descendants().length - rmca.leaves().length), (raca.descendants().length - raca.leaves().length), (rpca.descendants().length - rpca.leaves().length)]);
}


//Checking if arrays are equal
// Warn if overriding existing method
if(Array.prototype.equals)
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;
        }
        else if (this[i] != array[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
}
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {enumerable: false});




//Description: Interaction to select parent and child branches of the selected nodes. Each selection will color the selected branch in pop-out color and the corresponding arteries in subtle color
//Input: node,parent,children
//Output: Highlighting of the arteries

function stenosisTask(node,parent,children)
{
    let nodeColor = "#e41a1c";
    let otherNodes = "#377eb8";
    d3.select("#linkFG"+node.data.childs.reduce(function(a,b){return a+b})).style("stroke","#e41a1c");
    d3.select("#linkFG"+parent.data.childs.reduce(function(a,b){return a+b})).style("stroke","#377eb8");
    d3.select("#linkFG"+children[0].data.childs.reduce(function(a,b){return a+b})).style("stroke","#377eb8");
    d3.select("#linkFG"+children[1].data.childs.reduce(function(a,b){return a+b})).style("stroke","#377eb8");

    highLightSegment(node,nodeColor);
    highLightSegment(parent,otherNodes);
    highLightSegment(children[0],otherNodes);
    highLightSegment(children[1],otherNodes);
}

//Description: Interaction to traverse finding path between two points. This function can be divided into two parts: rules for the base
function storeTerminatingBranchIds(rmca,raca,rpca,lpca,laca,lmca)
{
    storeTerminationBranchIDs['rmca'] = rmca.data.childs.reduce(function(a,b){return a+b});
    storeTerminationBranchIDs['raca'] = raca.data.childs.reduce(function(a,b){return a+b});
    storeTerminationBranchIDs['rpca'] = rpca.data.childs.reduce(function(a,b){return a+b});
    storeTerminationBranchIDs['lpca'] = lpca.data.childs.reduce(function(a,b){return a+b});
    storeTerminationBranchIDs['laca'] = laca.data.childs.reduce(function(a,b){return a+b});
    storeTerminationBranchIDs['lmca'] = lmca.data.childs.reduce(function(a,b){return a+b});
}


function therapeuticPlanning(startNode, EndNode, globalDataStructure)
{
    //Store the starting points of the four branches MCA,ACA and PCA.
    //Then using type find the path which is the closest
    var leftICChildNodes=globalDataStructure.fetchLeftICChildNodes();
    var rightICChildNodes=globalDataStructure.fetchRightICChildNodes();
    let basilarBranchids = globalDataStructure.fetchBasilarBranchid();

    let type = startNode.data.type;
    let finishNode;
    let notaValidSelection = false;

    //Giving the start node a distinct color
    d3.select("#linkFG" + startNode.data.childs.reduce(function (a, b) {
            return a + b
        })).style("stroke", "#e41a1c");
    highLightSegment(startNode,"#e41a1c")


    if(type == 3){
        finishNode =  storeTerminationBranchIDs['rmca'];
        d3.select("#linkFG" + rightICChildNodes.reduce(function (a, b) {
                return a + b
            })).style("stroke", "");
        let d={};
        d.data={};
        d.data.childs=rightICChildNodes;
        highLightSegment(d)

    }
    else if(type == 2)
    {
        finishNode =  storeTerminationBranchIDs['raca'];
        d3.select("#linkFG" + rightICChildNodes.reduce(function (a, b) {
                return a + b
            })).style("stroke", "");
        let d={};
        d.data={};
        d.data.childs=rightICChildNodes;
        highLightSegment(d)


    }
    else if(type == 6)
    {
        finishNode =  storeTerminationBranchIDs['rpca'];
        d3.select("#linkFG" + basilarBranchids.reduce(function (a, b) {
                return a + b
            })).style("stroke", "");
        let d={};
        d.data={};
        d.data.childs=basilarBranchids;
        highLightSegment(d)

    }
    else if(type == 7)
    {
        finishNode =  storeTerminationBranchIDs['lpca'];
        d3.select("#linkFG" + basilarBranchids.reduce(function (a, b) {
                return a + b
            })).style("stroke", "");
        let d={};
        d.data={};
        d.data.childs=basilarBranchids;
        highLightSegment(d)

    }
    else if(type == 5)
    {
        finishNode =  storeTerminationBranchIDs['laca'];
        d3.select("#linkFG" + leftICChildNodes.reduce(function (a, b) {
                return a + b
            })).style("stroke", "");
        let d={};
        d.data={};
        d.data.childs=leftICChildNodes;
        highLightSegment(d)


    }
    else if(type == 4)
    {
        finishNode =  storeTerminationBranchIDs['lmca'];
        d3.select("#linkFG" + leftICChildNodes.reduce(function (a, b) {
                return a + b
            })).style("stroke", "");
        let d={};
        d.data={};
        d.data.childs=leftICChildNodes;
        highLightSegment(d)

    }
    else{
        notaValidSelection = true;
    }



    if(!notaValidSelection) {

        // function test()
        // {
        //     startNode = startNode.parent;
        //     d3.select("#linkFG" + startNode.data.childs.reduce(function (a, b) {
        //                 return a + b
        //             })).style("stroke", "");
        //
        //     if(startNode.data.childs.reduce(function (a, b) {return a + b}) == finishNode){
        //         console.log("Reaching here")
        //         window.clearInterval(timeout)
        //     }
        // }
        //
        // timeOut = setInterval(test, 1000);


        //
        while (startNode.data.childs.reduce(function (a, b) {return a + b}) != finishNode) {
            startNode = startNode.parent;
            d3.select("#linkFG" + startNode.data.childs.reduce(function (a, b) {
                    return a + b
                })).style("stroke", "");
            highLightSegment(startNode);

        }
    }

}


// function drawBrainMap(globalData,viewSpec)
//  {
//       d3.select(".chart").remove()
//       //var data= globalData.fetchDataForScatterPlot();
//       var arteries=globalData.fetchDataForArteries();
//       var treeData=globalData.fetchtreeData();
//       var nodes = d3.hierarchy(treeData).descendants();
//       var bloodFlow=globalData.fetchBloodFlowSymmetry()
//       var basilarBranchids=globalData.fetchBasilarBranchid();
//
//      var leftPCA=globalData.fetchLeftPCA()
//      var rightPCA=globalData.fetchRightPCA()
//
//
//      // var basilar=[145, 146, 147,46,47]
//
//
//      // basilar.forEach(function(d){
//      //     basilarBranchids.push(d)
//      // })
//
//
//
//       var margin = {top: 20, right: 20, bottom: 20, left: 20}
//           , width = $('#brainmap').innerWidth() - margin.left - margin.right
//           , height = $('#brainmap').innerWidth() - margin.top - margin.bottom;
//
//         var x = d3.scaleLinear()
//                   .domain([d3.min(arteries, function(d) { return d.x1; }), d3.max(arteries, function(d) { return d.x2 })])
//                   .range([ 0, width ]);
//
//         var y = d3.scaleLinear()
//                 .domain([d3.min(arteries, function(d) { return d.y1; }), d3.max(arteries, function(d) { return d.y1; })])
//                 .range([ height, 0 ]);
//
//         radi=arteries.map(function(artery){
//           return artery.radius
//         })
//
//         var minRadius= d3.min(radi, function(d) {return d; }) == 0 ? 0.3 : d3.min(radi, function(d) {return d; })
//
//         var radius= d3.scaleLinear()
//                   .domain([minRadius, d3.max(radi, function(d) { return d; })])
//                   .range([ 1, 10 ]);
//
//
//      var color=d3.scaleOrdinal().domain([0,2,3,4,5,6,7]).range(['#1b9e77','#d95f02','#7570b3','#e7298a','#66a61e','#e6ab02','#a6761d'])
//
//
//
//          // Define the line
//         var line = d3.line()
//             .x(function(d) { return x(d[0]); })
//             .y(function(d) { return y(d[1]); })
//
//         var chart = d3.select('#brainmap')
//            .append('svg:svg')
//            .attr('width', width + margin.right + margin.left)
//            .attr('height', height + margin.top + margin.bottom)
//            .attr('class', 'chart')
//
//             var main = chart.append('g')
//            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
//            .attr('width', width)
//            .attr('height', height)
//            .attr('class', 'main')
//
//             // draw the x axis
//            //  var xAxis = d3.axisBottom(x)
//            //
//            //   // svg.append("path")
//            //   //    .attr("class", "line")
//            //   //    .attr("d", valueline(data));
//            //
//            //  main.append('g')
//            // .attr('transform', 'translate(0,' + height + ')')
//            // .attr('class', 'main axis date')
//            // .call(xAxis);
//
//         ////We are going to append paths one at a time and create an animation to view the transition
//         //viewSpec.getView()=="Normal"
//           index=0
//
//
//      function drawArteries(index){
//             data=[[arteries[index].x1,arteries[index].y1],[arteries[index].x2,arteries[index].y2]]
//             path=main.append("path")
//             .datum(data)
//               .attr("fill", "none")
//                 .attr("class","C_"+arteries[index].nodeid)
//                 .attr("id","pathBM")
//               //  .attr("stroke","steelblue")
//               .attr("stroke", function(){
//                   if(bloodFlow) {return colorEncodingForBloodFlow(arteries[index].bloodFlow , arteries[index].depth)
//                       // if (arteries[index].bloodFlow == undefined) {
//                       //     return '#1b9e77'
//                       // }
//                       // else {
//                       //     return d3.interpolateRdYlBu(arteries[index].bloodFlow / (15000 / (Math.pow(2, arteries[index].depth))))
//                       // }
//                   }
//                   else{
//
//                       var PC1array=leftPCA.concat(rightPCA)
//                       if(PC1array.indexOf(index)!=-1){
//                             return "cornflowerblue"
//                         }
//                            return colorSymmetry(arteries[index].type)
//                        }
//                       //return color(arteries[index].type)
//                   })
//
//                .attr("stroke-width", function(){return radius(arteries[index].radius)})
//               //   .attr("opacity",function(){
//               //       if(arteries[index].type==2 ||arteries[index].type==3||arteries[index].type==4||arteries[index].type==5||arteries[index].type==6||arteries[index].type==7){
//               //           return 0
//               //       }
//               //       else{
//               //           return 1
//               //       }
//               //           })
//               .attr("d", line);
//
//                 var totalLength = path.node().getTotalLength();
//
//           // Set Properties of Dash Array and Dash Offset and initiate Transition
//              path
//               .attr("stroke-dasharray", totalLength + " " + totalLength)
//               .attr("stroke-dashoffset", totalLength)
//               .transition() // Call Transition Method
//               .duration(0) // Set Duration timing (ms)
//               .ease(d3.easeLinear) // Set Easing option
//               .attr("stroke-dashoffset", 0)
//               .on("end", function(){
//               index=index+1;
//               if(index!=arteries.length){
//               drawArteries(index)
//               }
//               else{
//                 //return "success"
//               }
//             });
//
//
//
//          basilarBranchids.forEach(function(d){
//              d3.select(".C_"+d).attr("stroke","sandybrown").attr("opacity",1)
//          })
//
//          if(globalHighlightedSegment){
//              highLightSegment(globalHighlightedSegment)}
//      }
//
//
//      drawArteries(index);
//
//
//
//      // var promise1 = new Promise(function(resolve, reject) {
//      //     if(val=="success"){
//      //         resolve('Success!');
//      //
//      //     }
//      // });
//      //
//      // promise1.then(function(value) {
//      //     console.log(value);
//      //     // expected output: "Success!"
//      // });
//
//      // Checking if a component is already highlighted
//
//
// }
//