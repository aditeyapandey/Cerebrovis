/**
 * Created by aditeyapandey on 1/14/19.
 */


//Description: Function to find the COW arteries from the real data
//Input: Original Data array with all the segments
//Output: Returns artery data with  array with only COW data

function getDataforCOW(result,viewspecs)
{
    // let result = input.filter(function(el){
    //     return el['type']==0
    // })
    pointsList=getKeys(result)
    var arteries=[]
    for (var i=0;i<pointsList.length;i++){
        if(result[parseInt(pointsList[i])]['parent']==-1){
            parent=result[parseInt(pointsList[i])]['parent']
            //When parent is -1 then we have no parent, so skip this node
        }
        else{
            //Draw a line from parent to child
            parent=result[parseInt(pointsList[i])]['parent']
            x1=result[parent][viewspecs.x]
            y1=result[parent][viewspecs.y]
            x2=result[parseInt(pointsList[i])][viewspecs.x]
            y2=result[parseInt(pointsList[i])][viewspecs.y]
            width=result[parseInt(pointsList[i])]['radius']
            nodeid=parseInt(pointsList[i])
            type = result[parseInt(pointsList[i])]['type']
            artery={"nodeid":nodeid,"parent":parent,"x1":x1,"y1":y1,"x2":x2,"y2":y2,"radius":width,'type':type}
            arteries.push(artery)
        }
    }


    result = arteries.filter(function(el){
        return (el['type']==0 & el['radius']>0.7)
    })


    return result
}