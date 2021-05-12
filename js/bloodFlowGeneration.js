/**
 * Created by aditeyapandey on 11/22/17.
 */

//Send the tree structure
function generateBloodFlow(treeStructure,startFlow)
{

    treeStructure.bloodFlow=startFlow;

    if(treeStructure.children != undefined){
        for(var i=0;i<treeStructure.children.length;i++){
            treeStructure.children[i]=generateBloodFlow(treeStructure.children[i],startFlow/2+((startFlow/5)*Math.random()))
        }
    }
    else{
        return treeStructure
    }

    return treeStructure
}

var blockageOccured=false;

function generateBloodFlowWithBlockage(treeStructure,branchData,startFlow,randomVal,arteries)
{

      //  randomVal=147
    //randomVal=1383
    //randomVal=2978
    //randomVal=1531
   //randomVal=1522
    //randomVal=2989
    treeStructure.bloodFlow=startFlow;
    branchData.bloodFlow=startFlow;
    var blockageFound= false;
    var presentAsChild=false;
    if(treeStructure.childs != undefined){
        if(treeStructure.childs.indexOf(randomVal) !=-1){
            presentAsChild=true
        }
        treeStructure.childs.forEach(function(d){
            if(arteries[d] != undefined){
                arteries[d].bloodFlow=startFlow
            }

        })
    }
    if((treeStructure.name == randomVal || presentAsChild) && !blockageOccured )
    {
        blockageFound=true

        blockageOccured=true
    }
    if(treeStructure.children != undefined){
        for(var i=0;i<treeStructure.children.length;i++){
            if(blockageFound){
                //flow=0
                flow=startFlow/3-((startFlow/4)*Math.random())
                // if(treeStructure.type == 0){
                //     flow=startFlow-(10*Math.random())
                // }
                // else{
                //     flow=startFlow-((startFlow/4)*Math.random())
                // }
                treeStructure.children[i]=generateBloodFlowWithBlockage(treeStructure.children[i],branchData.branchset[i],flow,randomVal,arteries)[0]

            }else{
                if(treeStructure.type == 0){
                    flow=startFlow-(10*Math.random())
                }
                else{
                    flow=startFlow-((startFlow/4)*Math.random())
                }
                treeStructure.children[i]=generateBloodFlowWithBlockage(treeStructure.children[i],branchData.branchset[i],flow,randomVal,arteries)[0]
            }
        }
    }
    else{
        // globalDataStructures.setDataforArteries(arteries)
        return [treeStructure,arteries,branchData,treeStructure]
    }

    return [treeStructure,arteries,branchData,treeStructure]

}

function generateBloodFlowWithBlockageForNewView(treeStructure,startFlow,randomVal,arteries)
{

    treeStructure.bloodFlow=startFlow;
    var blockageFound = false;
    var presentAsChild = false;
    if(treeStructure.childs != undefined){
        if(treeStructure.childs.indexOf(randomVal) !=-1){
            presentAsChild=true;
        }
        treeStructure.childs.forEach(function(d){
            if(arteries[d] != undefined){

                arteries[d].bloodFlow=startFlow;
               // console.log(arteries[d])
            }

        })
    }
    if((treeStructure.name == randomVal || presentAsChild) && !blockageOccured )
    {
        blockageFound=true;
        blockageOccured=true;
    }
    if(treeStructure.children != undefined){

        for(var i=0;i<treeStructure.children.length;i++) {
            if (blockageFound) {
                //flow=0
                flow = startFlow / 3 - ((startFlow / 4) * Math.random())
                // if(treeStructure.type == 0){
                //     flow=startFlow-(10*Math.random())
                // }
                // else{
                //     flow=startFlow-((startFlow/4)*Math.random())
                // }
                treeStructure.children[i] = generateBloodFlowWithBlockageForNewView(treeStructure.children[i], flow, randomVal, arteries)[0]

            } else {
                if (treeStructure.type == 0) {
                    flow = startFlow - (10 * Math.random())
                }
                else {
                    flow = startFlow - ((startFlow / 4) * Math.random())
                }
                treeStructure.children[i] = generateBloodFlowWithBlockageForNewView(treeStructure.children[i], flow, randomVal, arteries)[0]
            }
        }


        // for(var i=0;i<treeStructure.children.length;i++){
        //     if(blockageFound){
        //         treeStructure.children[i]=generateBloodFlowWithBlockageForNewView(treeStructure.children[i],startFlow/2-((startFlow/4)*Math.random()),randomVal,arteries)[0]
        //
        //     }else{
        //         if(treeStructure.type == 0){
        //             flow=startFlow;
        //         }
        //         else{
        //             flow=startFlow-((startFlow/2)*Math.random())
        //         }
        //         treeStructure.children[i]=generateBloodFlowWithBlockageForNewView(treeStructure.children[i],flow,randomVal,arteries)[0];
        //     }
        // }
    }
    else{
        // globalDataStructures.setDataforArteries(arteries)
        return [treeStructure,arteries]
    }

    return [treeStructure,arteries]

}


function testgenerateBloodFlowWithBlockage(treeStructure,startFlow,randomVal,arteries)
{

    treeStructure.bloodFlow=startFlow;
    var blockageFound= false;
    var presentAsChild=false;
    if(treeStructure.data.childs != undefined){
        if(treeStructure.data.childs.indexOf(randomVal) !=-1){
            presentAsChild=true
        }
        treeStructure.data.childs.forEach(function(d){
            if(arteries[d] != undefined){
                arteries[d].depth=1
                //arteries[d].depth=treeStructure.depth
            }

        })
    }
    if((treeStructure.name == randomVal || presentAsChild) && !blockageOccured )
    {
        blockageFound=true;
        blockageOccured=true;
    }
    if(treeStructure.children != undefined){
        for(var i=0;i<treeStructure.children.length;i++){
            if(blockageFound){
                treeStructure.children[i]=testgenerateBloodFlowWithBlockage(treeStructure.children[i],startFlow/4-((startFlow/5)*Math.random()),randomVal,arteries)[0]

            }else{
                treeStructure.children[i]=testgenerateBloodFlowWithBlockage(treeStructure.children[i],startFlow/2-((startFlow/5)*Math.random()),randomVal,arteries)[0]
            }
        }
    }
    else{
        // globalDataStructures.setDataforArteries(arteries)
        return [treeStructure,arteries]
    }
    return [treeStructure,arteries]
}
