/**
 * Created by aditeyapandey on 11/14/17.
 */


// var arteryParts= function (){
//     return {'RACA':{part:2,condition:true},'RPCA':{part:3,condition:true},'LPCA':{part:4,condition:true},'LACA':{part:5,condition:true},"RMCA":{part:6,condition:true},"LMCA":{part:7,condition:true}}
// }
var arteryParts= function (){
    return {'RACA':{part:2,condition:true},'RMCA':{part:3,condition:true},'LMCA':{part:4,condition:true},'LACA':{part:5,condition:true},"RPCA":{part:6,condition:true},"LPCA":{part:7,condition:true}}
}


var arteryLabelsArcs=arteryParts();
var arteryLabels=arteryParts();
var testFindCOWArteries=arteryParts();
var globarTreeSampleForCOW={};

//Artery Width Storage Dictionary
arteryWidth = {};

//Store all the arteries indexed by their node id
arteryStorageByIndex = {};


//


function getDataforArteries(result,viewspecs)
{
    console.log(result)
    pointsList=getKeys(result);
    var arteries=[];
    for (var i=0;i<pointsList.length;i++){
        if(result[parseInt(pointsList[i])]['parent']==-1){
            parent=result[parseInt(pointsList[i])]['parent'];
            //When parent is -1 then we have no parent, so skip this node
        }
        else{
            //Draw a line from parent to child
            parent=result[parseInt(pointsList[i])]['parent'];
            x1=result[parent][viewspecs.x];
            y1=result[parent][viewspecs.y];
            x2=result[parseInt(pointsList[i])][viewspecs.x];
            y2=result[parseInt(pointsList[i])][viewspecs.y];
            width=result[parseInt(pointsList[i])]['radius'];
            nodeid=parseInt(pointsList[i]);
            z = result[parent]['z'];
            type = result[parseInt(pointsList[i])]['type'];
            artery={"nodeid":nodeid,"parent":parent,"x1":x1,"y1":y1,"x2":x2,"y2":y2,"radius":width,'type':type};
            arteryStorageByIndex[nodeid] = {"nodeid":nodeid,"parent":parent,"x1":x1,"y1":y1,"x2":x2,"y2":y2,z:z,"radius":width,'type':type};
            arteries.push(artery);
        }
    }
    return arteries;
}

function getDataForScatterPlot(result,viewspecs)
{
    pointsList=getKeys(result)
    var dataForScatterPlot=[]
    for (var i=0;i<pointsList.length;i++){
        twoDpoint=getTwoDCoordinates(result[parseInt(pointsList[i])][viewspecs.x],result[parseInt(pointsList[i])][viewspecs.y])
        dataForScatterPlot.push(twoDpoint)
    }
    // console.log(dataForScatterPlot)
    return dataForScatterPlot
}

function getParentChildJson(result)
{
    pointsList=getKeys(result)
    node={}
    //Creating an array of children for all nodes
    for (var i=0;i<pointsList.length;i++){
        //Key does not exists
        if(node[result[parseInt(pointsList[i])]['parent']] == undefined)
        {
            node[result[parseInt(pointsList[i])]['parent']] = new Array();
            node[result[parseInt(pointsList[i])]['parent']].push(parseInt(pointsList[i]))
        }
        //Key exists
        else{
            node[result[parseInt(pointsList[i])]['parent']].push(parseInt(pointsList[i]))
        }
    }

    //This piece of code uses a depth first search to find all the parts of an artery and then creates a dictionary with root of the artery as the key
    segments=findSegments(node,-1,1)

    var treeData={}
    var treeDataCOW={}

    treeDataStructure=getHierarchy(segments,treeData,1,result)
    branchDataStructure=getHierarchyBranchSet(segments,treeData,1,result)

    testData=getHierarchyCOW(segments,treeDataCOW,1,result)
    labelCOWarteries(treeDataStructure)

    return [visualizationData,branchDataStructure,segments,basilarData,basilarBranchids,leftICAChildElements,rightICAChildElements,leftPCA,rightPCA,arteryWidth,arteryStorageByIndex]
}

//Find segments loops through all the children of a node and finds the length or in other words all the reachable segments from the node and seperates out the two bifurcations of the nodes.
function findSegments(node,Root,Child)
{
    if(Segments[Root]==undefined){
        Segments[Root]= new Array()
        Segments[Root].push(Child)
    }
    else{
        Segments[Root].push(Child)
    }

    if(node[Child]==undefined){
        childNodesLength=0
    }
    else{
        childNodesLength=node[Child].length
    }

    if(childNodesLength>=2){
        //Use local variables for Recursion
        var cnl=childNodesLength
        var childCurrent=Child
        var rootCurrent=Root
        for (var i=0;i<cnl;i++)
        {
            findSegments(node,childCurrent,node[childCurrent][i])
            if(i!=cnl-1)
            {Segments[childCurrent].push(-999)}
        }

    }
    else if(childNodesLength==1){
        findSegments(node,Root,node[Child][0])
    }
    else{
        return
    }

    return Segments
}

function getHierarchy(segments,treeData,root,result)
{

    if(treeData.name== undefined){
        treeData={name:root,type:0}
    }

    //find children of all the root nodes

    childrenofRoot=segments[root]
    if(childrenofRoot.indexOf(-999)==-1)
    {
        //Assiging type here to avoid checking in the loop
        treeData['children']= new Array()
        treeData['children'].push({
            name:root,
            size:childrenofRoot.length,
            childs:childrenofRoot,
            type:0
        });


        for (var i=0;i<childrenofRoot.length;i++){
            if(segments[childrenofRoot[i]] != undefined){
                getHierarchy(segments,treeData.children[0],childrenofRoot[i],result)
            }
        }
    }

    else{
        var parts=childrenofRoot.indexOf(-999);
        var children=childrenofRoot;
        var countofBreaks=childrenofRoot.reduce(function(a, e, i) {
            if (e === -999)
                a.push(i);
            return a;
        }, []);
        treeData['children']= new Array()

        for(var i=0;i<countofBreaks.length+1;i++)
        {
            var subchildren=[]

            if(i==0){
                subchildren=children.slice(0,parts)
            }
            else{
                subchildren=children.slice(parts+1,children.length)
            }

            //function to compute true radius
            radi=computeRadius(subchildren,result)
            //Store the radius for each element
            storeArteryWidthPerElement(subchildren,radi)
            //Store the average xyz coordinates for each segment
            storeAvgArteryCoord(subchildren,result)

            treeData['children'].push({
                name:root,
                size:subchildren.length,
                childs:subchildren,
                type : result[subchildren[0]].type,
                radius: radi,
                xcord: result[subchildren[0]].x

            })

            for (var j=0;j<subchildren.length;j++){
                if(segments[subchildren[j]] != undefined){

                    getHierarchy(segments,treeData.children[i],subchildren[j],result)
                }
            }
        }

    }
    return treeData
}

//This function takes a list of items and the complete data as input and calculates the average width of the artery
//Returns the average width of the artery
function computeRadius(data,result)
{
    if(data == undefined){
        var segments=[0.5]
    }
    else{
        var segments=data
    }

    var radiusLengths=[];
    var radiusSum=0
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
    return(radiusSum/radiusLengths.length)
}

//This function populates a global index to store the  average radius computed previously for each element in the data
//Returns null
function storeArteryWidthPerElement(segments,radius)
{
    segments.forEach(function(d)
    {
        arteryWidth[d]=radius
    })
}

//This function stores the average the xyz coordinates of a the artery, by using an average of the coordinates from all the segments
//Input: Segment list, Input data in SWC format(also known as result in the function)
//Output: Stores the results from the artery in a global array
function storeAvgArteryCoord (segments, data)
{
    let xyzList=[]
    segments.forEach(function(d){
        xyzList.push([data[d].x,data[d].y,data[d].z])
    })
    let avgXYZ = computeAverage(xyzList)
    segments.forEach(function(d){
        arteryStorageByIndex[d]['averageXYZ'] = avgXYZ
    })
}

//This function returns the average x,y,z for a set of coordinates
//Input: List of [x,y,z] points
//Output: A single tuple [x,y,z]
function computeAverage(list)
{
    const averageX = list.reduce((sume, el) => sume + el[0], 0) / list.length;
    const averageY = list.reduce((sume, el) => sume + el[1], 0) / list.length;
    const averageZ = list.reduce((sume, el) => sume + el[2], 0) / list.length;

    return [averageX,averageY,averageZ]

}

function getHierarchyCOW(segments,treeDataCOW,root,result)
{
//call this function at origing with an empty array
    if(treeDataCOW.name== undefined){
        treeDataCOW={name:root,type:0}
    }



    //find children of all the root nodes
    childrenofRoot=segments[root]
    if(childrenofRoot.indexOf(-999)==-1)
    {
        //Assiging type here to avoid checking in the loop
        treeDataCOW['children']= new Array()
        treeDataCOW['children'].push({
            name:root,
            size:childrenofRoot.length,
            childs:childrenofRoot,
            type:0
        })

        console.log(treeDataCOW)

        for (var i=0;i<childrenofRoot.length;i++){
            if(segments[childrenofRoot[i]] != undefined){
                getHierarchyCOW(segments,treeDataCOW.children[0],childrenofRoot[i],result)
            }
        }
    }

    else{
        var parts=childrenofRoot.indexOf(-999)
        var children=childrenofRoot
        var countofBreaks=childrenofRoot.reduce(function(a, e, i) {
            if (e === -999)
                a.push(i);
            return a;
        }, []);
        treeDataCOW['children']= new Array()

        for(var i=0;i<countofBreaks.length+1;i++)
        {
            var subchildren=[]
            if(i==0){
                subchildren=children.slice(0,parts)
            }
            else{
                subchildren=children.slice(parts+1,children.length)
            }
            treeDataCOW['children'].push({
                name:root,
                size:subchildren.length,
                childs:subchildren,
                type : result[subchildren[0]].type,
                radius: result[subchildren[0]].radius
            })

            if(result[subchildren[0]].type==0){
                for (var j=0;j<subchildren.length;j++){
                    if(segments[subchildren[j]] != undefined){

                        getHierarchyCOW(segments,treeDataCOW.children[i],subchildren[j],result)
                    }
                }
            }

        }

    }
    return treeDataCOW
}

function getHierarchyBranchSet(segments,treeData,root,result)
{

    // Original function
    if(treeData.name== undefined){
        treeData={name:root,type:0}
    }

    //find children of all the root nodes
    childrenofRoot=segments[root]
    if(childrenofRoot.indexOf(-999)==-1)
    {
        //Assiging type here to avoid checking in the loop
        treeData['branchset']= new Array()
        treeData['branchset'].push({
            name:root,
            length:childrenofRoot.length,
            childs:childrenofRoot,
            type:0
        })

        for (var i=0;i<childrenofRoot.length;i++){
            if(segments[childrenofRoot[i]] != undefined){
                getHierarchyBranchSet(segments,treeData.branchset[0],childrenofRoot[i],result);
            }
        }
    }

    else{
        var parts=childrenofRoot.indexOf(-999)
        var children=childrenofRoot
        var countofBreaks=childrenofRoot.reduce(function(a, e, i) {
            if (e === -999)
                a.push(i);
            return a;
        }, []);
        treeData['branchset']= new Array()

        for(var i=0;i<countofBreaks.length+1;i++)
        {
            var subchildren=[]
            if(i==0){
                subchildren=children.slice(0,parts);
            }
            else{
                subchildren=children.slice(parts+1,children.length);
            }

            treeData['branchset'].push({
                name:root,
                length:subchildren.length,
                childs:subchildren,
                type : result[subchildren[0]].type
            })

            for (var j=0;j<subchildren.length;j++){
                if(segments[subchildren[j]] != undefined){
                    getHierarchyBranchSet(segments,treeData.branchset[i],subchildren[j],result)
                }
            }
        }

    }
    return treeData
}

function getKeys(dataobj)
{
    return Object.keys(dataobj);
}


function getTwoDCoordinates(x,y){
    u=x;
    v=y;

    return [u,v];

}


//Function: Creates a 2d array of points and then runs the clustering algorithm
//Input: IC child nodes and artery storage
//Output: Set of clusters
function clusterNodes(ICNodes, arteryStorage)
{
    console.log(ICNodes.length)
    let clusteringData=[];
    console.log(arteryStorage)
    ICNodes.forEach(function(d){
        let x = arteryStorage[d].x1;
        let y = arteryStorage[d].y1;
        clusteringData.push([x,y]);
    })

    //Difference points
    let anotherClusteringData = [];
    for (i=0;i<clusteringData.length-1;i++)
    {
        let x = Math.abs(clusteringData[i][0] - clusteringData[i+1][0]);
        let y = Math.abs(clusteringData[i][1] - clusteringData[i+1][1]);
        anotherClusteringData.push([x,y]);
    }

     return getClusters(anotherClusteringData,5);
}

//This function extracts the subtrees for all the six subtrees

function extractSubtree(treeDataStructure) {

    var tree=treeDataStructure

    //Most probably we are ignoring the first branch as we are taking the childer, if we instead take the part then we will get right estimate

    // if(tree.children != undefined ){
    //
    //     if (arteryLabelsArcs['RACA'].condition) {
    //         if (tree.type == arteryLabelsArcs['RACA'].part) {
    //             arteryLabelsArcs['RACA']['children'] = treeDataStructure.children
    //             arteryLabelsArcs['RACA'].condition = false
    //         }
    //     }
    //     if (arteryLabelsArcs['LACA'].condition) {
    //         if (tree.type == arteryLabelsArcs['LACA'].part) {
    //             arteryLabelsArcs['LACA']['children'] = treeDataStructure.children
    //             arteryLabelsArcs['LACA'].condition = false
    //         }
    //     }
    //     if (arteryLabelsArcs['LMCA'].condition) {
    //         if (tree.type == arteryLabelsArcs['LMCA'].part) {
    //             arteryLabelsArcs['LMCA']['children'] = treeDataStructure.children
    //             arteryLabelsArcs['LMCA'].condition = false
    //         }
    //     }
    //     if (arteryLabelsArcs['LPCA'].condition) {
    //         if (tree.type == arteryLabelsArcs['LPCA'].part) {
    //             arteryLabelsArcs['LPCA']['children'] = treeDataStructure.children
    //             arteryLabelsArcs['LPCA'].condition = false
    //         }
    //     }
    //     if (arteryLabelsArcs['RMCA'].condition) {
    //         if (tree.type == arteryLabelsArcs['RMCA'].part) {
    //             arteryLabelsArcs['RMCA']['children'] = treeDataStructure.children
    //             arteryLabelsArcs['RMCA'].condition = false
    //         }
    //     }
    //     if (arteryLabelsArcs['RPCA'].condition) {
    //         if (tree.type == arteryLabelsArcs['RPCA'].part) {
    //             arteryLabelsArcs['RPCA']['children'] = treeDataStructure.children
    //             arteryLabelsArcs['RPCA'].condition = false
    //         }
    //     }
    //
    //         extractSubtree(tree.children[0])
    //         extractSubtree(tree.children[1])
    //
    // }
    // else{return}


    // Using array as

    if(tree.children != undefined ){

        if (arteryLabelsArcs['RACA'].condition) {
            if (tree.type == arteryLabelsArcs['RACA'].part) {
                arteryLabelsArcs['RACA']['children'] = [treeDataStructure]
                arteryLabelsArcs['RACA'].condition = false
            }
        }
        if (arteryLabelsArcs['LACA'].condition) {
            if (tree.type == arteryLabelsArcs['LACA'].part) {
                arteryLabelsArcs['LACA']['children'] = [treeDataStructure]
                arteryLabelsArcs['LACA'].condition = false
            }
        }
        if (arteryLabelsArcs['LMCA'].condition) {
            if (tree.type == arteryLabelsArcs['LMCA'].part) {
                arteryLabelsArcs['LMCA']['children'] = [treeDataStructure]
                arteryLabelsArcs['LMCA'].condition = false
            }
        }
        if (arteryLabelsArcs['LPCA'].condition) {
            if (tree.type == arteryLabelsArcs['LPCA'].part) {
                arteryLabelsArcs['LPCA']['children'] = [treeDataStructure]
                arteryLabelsArcs['LPCA'].condition = false
            }
        }
        if (arteryLabelsArcs['RMCA'].condition) {
            if (tree.type == arteryLabelsArcs['RMCA'].part) {
                arteryLabelsArcs['RMCA']['children'] = [treeDataStructure]
                arteryLabelsArcs['RMCA'].condition = false
            }
        }
        if (arteryLabelsArcs['RPCA'].condition) {
            if (tree.type == arteryLabelsArcs['RPCA'].part) {
                arteryLabelsArcs['RPCA']['children'] = [treeDataStructure]
                arteryLabelsArcs['RPCA'].condition = false
            }
        }

        extractSubtree(tree.children[0])
        extractSubtree(tree.children[1])

    }
    else{return}

}

function extractSubtreeRectangular(treeDataStructure) {
    var tree=treeDataStructure

    if(tree.branchset != undefined ){

        if (arteryLabels['RACA'].condition) {
            if (tree.type == arteryLabels['RACA'].part) {
                arteryLabels['RACA']['branchset'] = treeDataStructure.branchset
                arteryLabels['RACA'].condition = false
            }
        }
        if (arteryLabels['LACA'].condition) {
            if (tree.type == arteryLabels['LACA'].part) {
                arteryLabels['LACA']['branchset'] = treeDataStructure.branchset
                arteryLabels['LACA'].condition = false
            }
        }
        if (arteryLabels['LMCA'].condition) {
            if (tree.type == arteryLabels['LMCA'].part) {
                arteryLabels['LMCA']['branchset'] = treeDataStructure.branchset
                arteryLabels['LMCA'].condition = false
            }
        }
        if (arteryLabels['LPCA'].condition) {
            if (tree.type == arteryLabels['LPCA'].part) {
                arteryLabels['LPCA']['branchset'] = treeDataStructure.branchset
                arteryLabels['LPCA'].condition = false
            }
        }
        if (arteryLabels['RMCA'].condition) {
            if (tree.type == arteryLabels['RMCA'].part) {
                arteryLabels['RMCA']['branchset'] = treeDataStructure.branchset
                arteryLabels['RMCA'].condition = false
            }
        }
        if (arteryLabels['RPCA'].condition) {
            if (tree.type == arteryLabels['RPCA'].part) {
                arteryLabels['RPCA']['branchset'] = treeDataStructure.branchset
                arteryLabels['RPCA'].condition = false
            }
        }

        extractSubtreeRectangular(tree.branchset[0])
        extractSubtreeRectangular(tree.branchset[1])

    }
    else{return}



    //console.log(arteryLabels)

}
var globalTest={}
//Have a global tree data structure which stores all the information about tree
// function extractBase(globarTreeSampleForCOW)
//
// {
//
//     var result = globarTreeSampleForCOW.children
//
//
//     globalTest['children']= new Array()
//
//
//     if(result != undefined && globarTreeSampleForCOW.type==0) {
//         for (var i = 0; i < result.length; i++)
//         {
//             // console.log(result[i])
//
//             globalTest['children'].push(result[i])
//             extractBase(result[i])
//         }
//     }
//     else{
//         return
//     }







    // testGlobalTree.children=[]
    // console.log(testGlobalTree)
    // if(tree.children != undefined ){
    //
    //     if (testFindCOWArteries['RACA'].condition) {
    //         if (tree.type == arteryLabelsArcs['RACA'].part) {
    //             testFindCOWArteries['RACA']['children'] = [treeDataStructure]
    //             testFindCOWArteries['RACA'].condition = false
    //         }
    //     }
    //     if (testFindCOWArteries['LACA'].condition) {
    //         if (tree.type == arteryLabelsArcs['LACA'].part) {
    //             testFindCOWArteries['LACA']['children'] = [treeDataStructure]
    //             testFindCOWArteries['LACA'].condition = false
    //         }
    //     }
    //     if (testFindCOWArteries['LMCA'].condition) {
    //         if (tree.type == arteryLabelsArcs['LMCA'].part) {
    //             testFindCOWArteries['LMCA']['children'] = [treeDataStructure]
    //             testFindCOWArteries['LMCA'].condition = false
    //         }
    //     }
    //     if (testFindCOWArteries['LPCA'].condition) {
    //         if (tree.type == arteryLabelsArcs['LPCA'].part) {
    //             testFindCOWArteries['LPCA']['children'] = [treeDataStructure]
    //             testFindCOWArteries['LPCA'].condition = false
    //         }
    //     }
    //     if (testFindCOWArteries['RMCA'].condition) {
    //         if (tree.type == arteryLabelsArcs['RMCA'].part) {
    //             testFindCOWArteries['RMCA']['children'] = [treeDataStructure]
    //             testFindCOWArteries['RMCA'].condition = false
    //         }
    //     }
    //     if (testFindCOWArteries['RPCA'].condition) {
    //         if (tree.type == arteryLabelsArcs['RPCA'].part) {
    //             testFindCOWArteries['RPCA']['children'] = [treeDataStructure]
    //             testFindCOWArteries['RPCA'].condition = false
    //         }
    //     }
    //     testGlobalTree.children.push(tree.children[0])
    //     // extractSubtree(tree.children[0])
    //     // extractSubtree(tree.children[1])
    //
    // }
    // else{return}

//}

// function hybridViz(treeData,temptree){
//
//     return treeData
//
//
//    // return treeData
//     //Original tree data
//     treeData123 = treeData.children[0].children[0].children[0]
//     temp1 = treeData123.children[0]
//     temp2 = treeData123.children[1]
//     treeData123.children[0] = temp2
//     treeData123.children[1] = temp1
//     //treeData.children.push(temptree.children[0].children[0])
//
//     treetemp1 = treeData123.children[0]
//     child1 = treetemp1.children[0].children[1].children[0]
//     child2 = treetemp1.children[0].children[1].children[1]
//     treetemp1.children[0].children[1].children[0] = child2
//     treetemp1.children[0].children[1].children[1] = child1
//     treetemp2 = treeData123.children[1]
//     branch3 = temptree.children[0].children[0].children[1]
//     branch1 = temptree.children[0].children[1]
//     branch3 = temptree.children[0].children[0].children[1]
//
//     branch2 = {
//         name: temptree.children[0].name,
//         bloodFlow: temptree.children[0].bloodFlow,
//         length: temptree.children[0].length,
//         childs: temptree.children[0].childs,
//         children: [branch3, branch1]
//     }
//     temptree.children[0] = branch2
//     // console.log(temptree)
//     // console.log(treeData)
//
//     treeDatafinal = {name: "New Tree", children: [treetemp1, treetemp2, temptree]}
//     // bloodFlow = true
//     return treeDatafinal
//
//
// }


