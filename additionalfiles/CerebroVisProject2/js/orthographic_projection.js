
//Global Variables
let Segments={};
let globalDataStructures;
let data1;
let viewspecs;

//The solution for maintaining global projection
let evaluation = false;
let stenosis = false;
let stenosisArray = [];


// Script to convert 3D projection to 2D projection ... orthographic projections.
function initializeView(){

    var fileName;
    function dataFileName() {
        var url = document.location.href,
            params = url.split('?')[1].split('&'),
            data = {}, tmp;
        for (var i = 0, l = params.length; i < l; i++) {
            tmp = params[i].split('=');
            data[tmp[0]] = tmp[1];
        }
        fileName=data.name;
    }
    dataFileName();

    //Reads the scan data from the firebase server
    promise=readdata(fileName);

    //Reads data from the metadata file
    readMetaData(fileName.split("_")[0]);

    //This block will set the evaluation parameter
    evaluation = true;
    stenosis = false;
    let abnormailityLocation;
    if(stenosis){
        abnormailityLocation = readStenosisData(fileName.split("_")[0]);
    }
    else{
        abnormailityLocation = readAneurysmData(fileName.split("_")[0]);
    }



    //console.log(stenosisLocation)

    // The stenosis condition is designed for checking if there is an evaluation condition to evaluate
    if(evaluation) {
        abnormailityLocation.then(function (r1) {

            console.log(r1)

            let condition = stenosis ? "stenosis":"aneurysm";
            stenosisArray = r1["Arteries"].split("-").map(function(d){return parseInt(d)});

            promise.then(function (data) {

                //Define projection and view, view options are Normal,Symmetry and projection options are : back,top
                viewspecs = new viewSpec("back", "Normal", "arcsD");
                view = viewspecs.getView();
                projection = viewspecs.getProjection();



                //  //Define the global data access structures at one place and access them whererever they are required
                globalDataStructures = new defineGlobalAccessDataStructures(data, projection,parseInt(r1['Parent']));


                //First gather the clustering information and then send it to
                //let clusteringData = clusterNodes(globalDataStructures.fetchRightICChildNodes(),globalDataStructures.fetchArteryStorageByIndex());

                drawBrainMap(globalDataStructures, viewspecs, 'brainmap', globalDataStructures.fetchDataForArteries(), globalDataStructures.fetchArteryWidth(), 1, globalDataStructures.fetchArteryStorageByIndex(),stenosisArray,condition)
                drawLabelsBrainMap("back", "brainmap", "#252525");

                //Drawing dendrograms
                drawDendrogram(globalDataStructures, view,stenosisArray,condition);

                //Testing the arcs in the main visualization area

                //drawBrainMap(globalDataStructures,viewspecs, 'dendrogram', globalDataStructures.fetchDataForCOW(), globalDataStructures.fetchArteryWidth(),3)

            });
        });
    }
    else {
        promise.then(function (data) {
            //Define projection and view, view options are Normal,Symmetry and projection options are : back,top
            viewspecs = new viewSpec("back", "Normal", "arcsD")
            view = viewspecs.getView();
            projection = viewspecs.getProjection();


            //  //Define the global data access structures at one place and access them whererever they are required
            globalDataStructures = new defineGlobalAccessDataStructures(data, projection);


            //First gather the clustering information and then send it to
            //let clusteringData = clusterNodes(globalDataStructures.fetchRightICChildNodes(),globalDataStructures.fetchArteryStorageByIndex());

            drawBrainMap(globalDataStructures, viewspecs, 'brainmap', globalDataStructures.fetchDataForArteries(), globalDataStructures.fetchArteryWidth(), 1, globalDataStructures.fetchArteryStorageByIndex());
            drawLabelsBrainMap("back", "brainmap", "#252525");

            //Drawing dendrograms
            drawDendrogram(globalDataStructures, view);

            //Testing the arcs in the main visualization area

            //drawBrainMap(globalDataStructures,viewspecs, 'dendrogram', globalDataStructures.fetchDataForCOW(), globalDataStructures.fetchArteryWidth(),3)

        });

    }
}




//This function should be called for changing the brain projection, just pass the projection as brainview variable and it will work, den
//Brain projection needs to be overloaded to persist the resistance

function changeProjection(brainView){


    var data=globalDataStructures.fetchData();

    viewspecs.setProjection(brainView);

    globalDataStructures.changeProjection(data,viewspecs.getProjection());


    if(evaluation){
        let condition = stenosis ? "stenosis":"aneurysm";
        drawBrainMap(globalDataStructures, viewspecs, 'brainmap', globalDataStructures.fetchDataForArteries(), globalDataStructures.fetchArteryWidth(), 1, globalDataStructures.fetchArteryStorageByIndex(),stenosisArray,condition)
        drawLabelsBrainMap(brainView,"brainmap","#252525");

    }
    else{
        drawBrainMap(globalDataStructures,viewspecs, 'brainmap', globalDataStructures.fetchDataForArteries(), globalDataStructures.fetchArteryWidth(),1,globalDataStructures.fetchArteryStorageByIndex())
        drawLabelsBrainMap(brainView,"brainmap","#252525");
    }


}



function addBloodFlowInSymmetry(val){
    if(evaluation){
        let condition = stenosis ? "stenosis":"aneurysm";
        globalDataStructures.setBloodBlowSymmetry(val);
        drawBrainMap(globalDataStructures,viewspecs, 'brainmap', globalDataStructures.fetchDataForArteries(), globalDataStructures.fetchArteryWidth(),1, globalDataStructures.fetchArteryStorageByIndex(),stenosisArray,condition)
        drawLabelsBrainMap(viewspecs.getProjectionType(),"brainmap","#252525");
        drawDendrogram(globalDataStructures,view,stenosisArray,condition);

    }
    else{
        globalDataStructures.setBloodBlowSymmetry(val);
        drawBrainMap(globalDataStructures,viewspecs, 'brainmap', globalDataStructures.fetchDataForArteries(), globalDataStructures.fetchArteryWidth(),1, globalDataStructures.fetchArteryStorageByIndex())
        drawLabelsBrainMap(viewspecs.getProjectionType(),"brainmap","#252525");
        drawDendrogram(globalDataStructures,view);
    }

}


initializeView();

//This function will console the inner width of the dengrogram
//Placing a hook on the resize event, this function will listen for all onresize event

//Input Null
//Description: Draws the BrainVisualization and Dendrogram Visualization
function resizeVis(){
    // Haven't resized in 100ms!
    drawBrainMap(globalDataStructures,viewspecs, 'brainmap', globalDataStructures.fetchDataForArteries(), globalDataStructures.fetchArteryWidth(),1, globalDataStructures.fetchArteryStorageByIndex())
    drawLabelsBrainMap(viewspecs.getProjectionType(),"brainmap","#252525")
    drawDendrogram(globalDataStructures,view)
}

//Description Waits for the user to stop resizing the screen and then calls a method
let createTimeout;
window.onresize = function(){
    clearTimeout(createTimeout);
    createTimeout = setTimeout(resizeVis, 100);
};

