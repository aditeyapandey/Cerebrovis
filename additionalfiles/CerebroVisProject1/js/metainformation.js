/**
 * Created by aditeyapandey on 11/14/17.
 */

//Projection type has to be a string , we have 3 types of projection back,top lateral
// var viewspec= function (projectionType,viewType){
//
//
//
//
//     if (projectionType=="back"){
//
//         return {x:"x",y:"y"}
//     }
//     else if(projectionType=="lateral"){
//         return {x:"z",y:"y"}
//     }
//     else if(projectionType=="top"){
//         return {x:"x",y:"z"}
//     }
//
//
//
//
// }

function viewSpec (projectionType,viewType)
{

    this.viewMode="Normal";
    if (viewType=="Symmetry"){
        this.viewMode="Symmetry"
    }
    else if(viewType=="Normal"){
        this.viewMode="Normal"
    }
    else{
        this.viewMode="Hybrid"
    }

    this.projection={x:"x",y:"y"};
    this.projectionType= projectionType;

    if (projectionType=="back"){

        this.projection={x:"x",y:"y"}
    }
    else if(projectionType=="lateral"){
        this.projection={x:"z",y:"y"};

    }
    else if(projectionType=="top"){
        this.projection={x:"y",y:"z"};
    }
    this.getView = function() {
        return this.viewMode;
    };
    this.getProjection=function(){
        return this.projection;
    };
    this.getProjectionType = function ()
    {
        return this.projectionType;
    };

    this.setViewMode=function(view){
        this.viewMode=view
    };

    this.setProjection=function(projectionVal){

        this.projectionType = projectionVal;

        if (projectionVal=="back"){
            this.projection={x:"x",y:"y"};
        }
        else if(projectionVal=="lateral"){
            this.projection={x:"z",y:"y"};
        }
        else if(projectionVal=="top"){
            this.projection={x:"x",y:"z"};
        }
    };

    this.treeView="arcsD";
    this.getTreeView = function() {
        return this.treeView;
    };
    this.setTreeView=function(tree){
        this.treeView=tree;
    }
}

//
// var arteryParts= function (){
//     return {'RACA':{part:2,condition:true},'RPCA':{part:3,condition:true},'LPCA':{part:4,condition:true},'LACA':{part:5,condition:true},"RMCA":{part:6,condition:true},"LMCA":{part:7,condition:true}}
// }

function defineGlobalAccessDataStructures (data,projection, stenosisLocation = -1)
{
    this.data=data;
    this.dataForScatterPlot = getDataForScatterPlot(data,projection);
    this.dataForArteries = getDataforArteries(data,projection);
    this.dataForCOW =  getDataforCOW(data,projection);
    this.hierarchyData = getParentChildJson(data);
    this.treeData = this.hierarchyData[0];
    this.branchData = this.hierarchyData[1];
    this.segments = this.hierarchyData[2];
    this.basilar = this.hierarchyData[3];
    this.basilarbranchids = this.hierarchyData[4];
    this.leftICChildNodes = this.hierarchyData[5];
    this.rightICChildNodes = this.hierarchyData[6];
    this.leftPCA = this.hierarchyData[7];
    this.rightPCA = this.hierarchyData[8];
    this.arteryWidth = this.hierarchyData[9];
    this.arteryStorageByIndex = this.hierarchyData[10];
    this.nodeId = getKeys(this.segments);
    this.arteryLabels = arteryLabelsArcs;
    this.arteryLabelsRectangular = arteryLabels;
    this.bloodFlowSymmetry = false;


    // console.log(this.treeData)
    // console.log(this.branchData)

    let randomElementNodeId;

    this.setDataforArteries=function(value){
        this.dataForArteries=value;
    }

    if(stenosisLocation == -1){
         // uncomment the line below for random stenosis
        // randomElementNodeId=this.nodeId[(Math.random() * this.nodeId.length) | 0];

        randomElementNodeId=-1

    }
    else{
        randomElementNodeId = stenosisLocation
    }

    //this.treeData = treeTransformation(this.treeData,this.treeData)
    //console.log(treeTransformation(this.treeData,this.treeData))
    bloodFlowtemp=generateBloodFlowWithBlockageForNewView(this.treeData,1000,parseInt(randomElementNodeId),this.dataForArteries)

    var treeCopy = jQuery.extend(true, {}, this.treeData);
    var branchCopy=jQuery.extend(true, {}, this.branchData);

    let nodes = d3.hierarchy(this.treeData);

    this.fetchBloodFlowSymmetry=function(){
        return this.bloodFlowSymmetry
    }
    this.setBloodBlowSymmetry=function(val)
    {
        this.bloodFlowSymmetry=val
    }

    this.fetchData=function(){
        return this.data
    }

    this.fetchDataForScatterPlot=function(){
        return this.dataForScatterPlot
    }

    this.fetchDataForArteries=function () {
    return this.dataForArteries
    }

    this.fetchDataForCOW = function (){
        return this.dataForCOW
    }

    this.fetchhierarchyData=function(){
        return this.hierarchyData
    }

    this.fetchtreeData=function(){
        return this.treeData
    }
    this.fetchBranchData=function(){
        return this.branchData
    }
    this.fetchBasilar=function(){
        return this.basilar
    }
    this.fetchBasilarBranchid=function(){
        return this.basilarbranchids
    }
    this.fetchLeftICChildNodes = function () {
        return this.leftICChildNodes
    }
    this.fetchRightICChildNodes = function () {
        return this.rightICChildNodes
    }
    this.fetchLeftPCA = function(){
        return this.leftPCA
    }
    this.fetchRightPCA = function(){
        return this.rightPCA
    }

    this.fetchArteryLabels=function(){
        return this.arteryLabels
    }
    this.fetchArteryLabelsRectangular=function(){
        return this.arteryLabelsRectangular;
    }
    this.setDataforArteries=function(value){
        this.dataForArteries=value;
    }
    this.fetchHybridData=function(value){
        return this.hybridTreeData
    }
    this.fetchArteryWidth = function(){
        return this.arteryWidth
    };
    this.fetchArteryStorageByIndex = function()
    {
      return this.arteryStorageByIndex
    };

    this.changedataForArteries=function(nodes){
        // console.log(nodes)
        // console.log(this.dataForScatterPlot)

        var filteringDatafomDataArteries=[];

        this.dataForArteries.forEach(function(d) {
            if (nodes.indexOf(d.nodeid) != -1) {
                filteringDatafomDataArteries.push(d)
            }
        });
        // })

        this.dataForArteries=filteringDatafomDataArteries;
    }
    this.resetdataForArteries=function(){
        this.dataForArteries=getDataforArteries(data,projection);

    }

    this.resetAll=function () {
        this.data=null;
        this.dataForScatterPlot=null;
        this.dataForArteries=null;
        this.hierarchyData=null;
        this.treeData=null;
        this.branchData=null;
        this.segments=null;
        this.nodeId=null;
        this.arteryLabels=null;
        this.arteryLabelsRectangular=null;


    }

    this.changeProjection=function(data,projection)
    {
        this.dataForScatterPlot=getDataForScatterPlot(data,projection);
        tempDataArteries=this.dataForArteries;
        this.dataForArteries=getDataforArteries(data,projection);

        this.dataForArteries.forEach(function(d,index){
          d.depth=tempDataArteries[index].depth;
          d.bloodFlow=tempDataArteries[index].bloodFlow;
        })
    }


}


