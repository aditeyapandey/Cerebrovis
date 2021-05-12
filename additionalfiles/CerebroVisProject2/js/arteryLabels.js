/**
 * Created by aditeyapandey on 7/21/18.
 */

//global variables for the labelling


var globalParentData={}

var globalFirstIC
var globalSecondIC


var leftICAChildElements=[];
var rightICAChildElements=[];

var leftPCA=[]
var rightPCA=[]

var globalFirstPCA
var globalFirstPCAArtery


var globalSecondPCA
var globalSecondArteryPCA

var basilarBranchesParent
var basilarBranch
var storeRadius=[]
var storeObject=[]
var storeParent=[]
var currentBranch=[]
var firstBasilar
var secondBasilar
var basilarData
var basilarExtension=[]
var basilarBranchids=[]
var basilarTempTestArray=[]

var visualizationData
var arraytoStoreChildVals=[]
var arraytoStoreChildValsFirstPCA=[]
var arraytoStoreChildValsSecondPCA=[]




function labelCOWarteries(data)
{

    //This function should just return the First IC with both the children

    dataCopy=$.extend(true, [], data);


    //Step 1 : findFirstIC is used to find all the child nodes of the first IC (first IC has a distinct character that it is one of the branches)
    var getDatafromFirstIC=findFirstIC(data)
    globalFirstIC=getDatafromFirstIC[0]
    arrayOfRecords=getDatafromFirstIC[1]
    globalFirstIC['childArray']=data.children[arrayOfRecords[0]].children[0]

    //console.log(globalFirstIC)


    //Step 2 : This method recursively finds second IC (whenever find a particular segment one can use the recursive code)
    findSecondIC(dataCopy)

    // Step 3 : We have to arrange the arteries in a defined order
    fixMCA(globalFirstIC,globalSecondIC)


    //Step 4 : The fourth step is to find all the arteries from Basilar structure
    findFirstICPCA(dataCopy,getDatafromFirstIC[1])

    //Step 5
    findBasilarBranches()

    //Step 6 : Finally create the datastructure which visualizes all of it
    createDataforPCA()

    //Step 7 : call the function to create new template
    newTemplate()


    //Step 8  : Interactivity of the internal carotids

    //This code should go into it's own function, the purpose of the code is to assign the right and left IC for selection and interactivity
    // //In this code we will push the child arrays in the the firstPCAChild element

    if(globalFirstIC.direction=="left")
    {
        for(var i=0;i<globalFirstIC.childArray.childs.length;i++)
        {
            leftICAChildElements.push(globalFirstIC.childArray.childs[i])
        }


        var childNodeArray=data.children
        for (var i=0;i<childNodeArray.length;i++)
        {
            var childsArray=childNodeArray[i].childs
            for(j=0;j<childsArray.length;j++){
                leftICAChildElements.push(childsArray[j])
            }
        }

    }
    else{
        for(var i=0;i<globalFirstIC.childArray.childs.length;i++)
        {
            rightICAChildElements.push(globalFirstIC.childArray.childs[i])
        }


        var childNodeArray=data.children
        for (var i=0;i<childNodeArray.length;i++)
        {
            var childsArray=childNodeArray[i].childs
            for(j=0;j<childsArray.length;j++){
                rightICAChildElements.push(childsArray[j])
            }
        }

    }

    //Test the second IC


    if(globalSecondIC.direction=="left")
    {
        var childNodeArray=globalSecondIC.children
        for (var i=0;i<childNodeArray.length;i++)
        {
            var childsArray=childNodeArray[i].childs
            for(j=0;j<childsArray.length;j++)
            {
                leftICAChildElements.push(childsArray[j])
            }
        }
    }
    else{
        var childNodeArray=globalSecondIC.children
        for (var i=0;i<childNodeArray.length;i++)
        {
            var childsArray=childNodeArray[i].childs
            for(j=0;j<childsArray.length;j++)
            {
                rightICAChildElements.push(childsArray[j])
            }
        }
    }



    //The right and left IC interaction code ends here

    // Step 9 : PCA interactivity and marking technique


    if(globalFirstIC.direction=="left"){

        var childElementsPCA=globalFirstPCAArtery.childs
         for(var i=0;i<childElementsPCA.length;i++)
         {
            leftPCA.push(childElementsPCA[i])
         }
    }
    else
    {
        var childElementsPCA=globalSecondArteryPCA.childs
        for(var i=0;i<childElementsPCA.length;i++)
        {
            leftPCA.push(childElementsPCA[i])
        }
    }

    if(globalFirstIC.direction=="right"){
        var childElementsPCA=globalFirstPCAArtery.childs
        for(var i=0;i<childElementsPCA.length;i++)
        {
            rightPCA.push(childElementsPCA[i])
        }
    }
    else
    {
        var childElementsPCA=globalSecondArteryPCA.childs
        for(var i=0;i<childElementsPCA.length;i++)
        {
            rightPCA.push(childElementsPCA[i])
        }

    }



}

//For IC1 we need to capture the IC and both the child nodes.


function findFirstIC(data){

    //first branch is always the internal carotid arteries also find out which side they will bend,
    //This array stores all the indexes of that allow to extract the first IC with it's immediate children
    arrayOfRecords=[]
    //Since the level of first IC is always same structurally we will just need to find the
    //Go to second level
    //Moving to the first Level
    if(data.children[0].children == undefined){
        firstLevel=data.children[1]
        arrayOfRecords.push(1)
    }
    else{
        firstLevel=data.children[0]
        arrayOfRecords.push(0)
    }

    //Moving to second Level : Here we have to find out 1. Which is the terminating ACA and MCA and 2. What is the other set of artery
    //First level children should never be undefined because that is a structural property.
    secondLevelChildren=firstLevel.children
    //Following for loop checks which branch is the ACA/MCA branch and vice versa
    for(var i=0;i<secondLevelChildren.length;i++)
    {
        newData=firstLevel.children[i];

        newDataChild=newData.children;

        //The if condition checks which is the branch for MCA and ACA, the else block pushes the array of records with the next level branch as it will be required for the next IC2
        if ((newDataChild[0].type != newDataChild[1].type) && (newData.type != newDataChild[1].type) && (newData.type != newDataChild[0].type))
        {
            //globalParentData=newData
        }
        else
        {
            arrayOfRecords.push(i)
        }
    }

    //This method finds all the main branches connected with IC1, however since PCA and MCA are connected to IC we will need to short circuit the branch connecting them.

    //Before altering the data and loosing the information, we need to transfer the data to another

    dataCopy=$.extend(true, {}, data);

    data.children[arrayOfRecords[0]].children[arrayOfRecords[1]].children=[]

    // This code removes the extra branch
    if(arrayOfRecords[1]==0){
        data.children[arrayOfRecords[0]].children=data.children[arrayOfRecords[0]].children.slice(1,2)

    }
    else{
        data.children[arrayOfRecords[0]].children=data.children[arrayOfRecords[0]].children.slice(0,1)
    }

    //console.log(data)


    return [data,arrayOfRecords]

}

function findSecondIC(data)
{
    var informationIC1={}

    if(data.children[0].children == undefined){
        informationIC1['tilt']='right'
    }
    else{
        informationIC1['tilt']='left'
    }

    //Find SecondIC
    var informationIC2={}

    if(informationIC1['tilt']=="left")
    {
        recursivelyFindThePosition(data.children[0],[0])
    }
    else{
        recursivelyFindThePosition(data.children[1],[1])
    }

}


//This function is a bit iterative, but what it basically does is send the child to the correct direction and the main array to a dfs based search
function recursivelyFindThePosition(data,finalArray)
{
    child=data.children

    //This step is mandatory, here we don't need the array of records because we are repeating the same process as done in previous step of finding which branch to iterate to find the next level of IC2
    for(var i=0;i<child.length;i++)
    {
        newData=data.children[i];
        //console.log(newData)
        newDataChild=newData.children;

        if ((newDataChild[0].type != newDataChild[1].type) && (newData.type != newDataChild[1].type) && (newData.type != newDataChild[0].type)) {
            //do nothing
        }
        else {
            finalArray.push(i)
        }
    }

    // This dfs function first we send the child which has the main or the IC2 branch, finalarray is the firstlevel and secondlevel array to point in the direction of second IC, finalarray[1] may give the index of the latest diversion ,data is the real data
    dfs(child[finalArray[1]],finalArray,finalArray[1],data)
}


//Now we know that the first time when both the left and right would be different that is location of IC2
//For javascript reading the tree you need to have two seperate call backs for both branches
//This method successfully gives IC2 of the tree
//At the end, the grandParent stores the information for the PCA and the childarray stores the artery which further branches out in the MCA and ACA
function dfs(parentdata,finalArray,index,grandParent) {

    var tdata=parentdata.children
    if(tdata!=undefined)
    {

        if(tdata[0].type!=tdata[1].type && (tdata[0].type!=0 ) && (tdata[1].type!=0 ))
        {
            globalSecondIC=grandParent
            globalSecondIC['direction']=determineRightLeft(tdata[0],tdata[1])

            globalSecondIC['childArray']=parentdata
        }

        dfs(tdata[0],finalArray,0,parentdata)
        dfs(tdata[1],finalArray,1,parentdata)
    }
}

//We need a function to determine which side goes to the right and which goes to the left
function determineRightLeft(firstChild,secondChild)

{

    //find both child nodes of the first and second IC's
    //This technique determines whether IC should go on right side or left side
    //But that also determines which side they will go finally
    if(firstChild.type == 2 || firstChild.type==3)
    {
        globalFirstIC['direction']="left"
        return "right"
    }
    else if(firstChild.type == 4 || firstChild.type == 5)
    {
        globalFirstIC['direction']="right"
        return "left"
    }

}

//This function swaps MCA with ACA, MCA should always be outside  side, therefore we are going to move the branch from inside to outside .
function fixMCA(firstIC,secondIC)
{
    //first find the index which contains

    var firstDefined
    var secondDefined

    for(var i=0;i<firstIC.children.length;i++)
    {
        if(firstIC.children[i].children!=undefined)
        {
            firstDefined=i
        }
    }

    for(var i=0;i<secondIC.children.length;i++)
    {
        if(secondIC.children[i].children!=undefined)
        {
            secondDefined=i
        }
    }




    //For the thing on the right MCA should be child 0

    if(firstIC.direction=="right")
    {
        //First get both the children
        var children = firstIC.children[firstDefined].children[0].children


        if(children[0].type ==3 )
        {
            var temp= firstIC.children[firstDefined].children[0].children[0]
            firstIC.children[firstDefined].children[0].children[0]=firstIC.children[firstDefined].children[0].children[1]
            firstIC.children[firstDefined].children[0].children[1]=temp
        }
    }
    else{
        var children = firstIC.children[firstDefined].children[0].children
        if(children[0].type ==5){
            var temp= firstIC.children[firstDefined].children[0].children[0]
            firstIC.children[firstDefined].children[0].children[0]=firstIC.children[firstDefined].children[0].children[1]
            firstIC.children[firstDefined].children[0].children[1]=temp
        }

    }

    if(secondIC.direction=="right")
    {
        //First get both the children
        var children = secondIC.children[secondDefined].children

        if(children[0].type ==3 )
        {
            var temp= secondIC.children[secondDefined].children[0]
            secondIC.children[secondDefined].children[0]=secondIC.children[secondDefined].children[1]
            secondIC.children[secondDefined].children[1]=temp
        }
    }
    else{
        var children = secondIC.children[secondDefined].children
        if(children[0].type ==5 ){
            var temp= secondIC.children[secondDefined].children[0]
            secondIC.children[secondDefined].children[0]=secondIC.children[secondDefined].children[1]
            secondIC.children[secondDefined].children[1]=temp
        }

    }


}

//By the end of next two functions we will have information about how the two PCA's, the PCA's have a color encoding which makes it easy to identify, but this technique can also be used without information of the color encoding.

function findFirstICPCA(dataCopy,arrayofRecords)
{
    //arteryConnetingPCA child nodes need to be swapped with MCA and PCA.

    globalFirstPCAArtery = $.extend(true, {}, dataCopy.children[arrayofRecords[0]].children[arrayofRecords[1]]);

    //Code to find the right child
    var children=dataCopy.children[arrayofRecords[0]].children[arrayofRecords[1]].children
    for(var i=0;i<children.length;i++){
        if(children[i].type==6 || children[i].type==7)
        {
            globalFirstPCA   = $.extend(true, {}, dataCopy.children[arrayofRecords[0]].children[arrayofRecords[1]].children[i]);
        }
        else{
            nextLevelChildren=children[i].children
            for(j=0;j<nextLevelChildren.length;j++){
                if(nextLevelChildren[i].type==6 || nextLevelChildren[i].type==7)
                {
                    globalFirstPCA   = $.extend(true, {}, dataCopy.children[arrayofRecords[0]].children[arrayofRecords[1]].children[i].children[j]);
                }
            }
        }
    }

    var dataFinal=$.extend(true, {}, dataCopy);
    findSecondPCA(dataFinal,globalFirstPCA.type,{})
}


//The aim of this function is to find the second PCA. The second PCA is always one step
//gp means grand parent data, the gp is most probably one level over the
function findSecondPCA(dataFinal,firstPCAType,gpDataFinal)
{

    var secondPCAType
    if(firstPCAType==6){
        secondPCAType=7
    }
    else{
        secondPCAType=6
    }

    var tdata=dataFinal.children

    if(tdata!=undefined)
    {
        if((tdata[0].type==0 && tdata[1].type==secondPCAType) || (tdata[1].type==0 && tdata[0].type==secondPCAType) )
        {
            basilarBranchesParent=gpDataFinal
            if(tdata[0].type==secondPCAType)
            {
                globalSecondPCA=tdata[0]
                globalSecondArteryPCA=tdata[1]
            }
            else{
                globalSecondPCA=tdata[1]
                globalSecondArteryPCA=tdata[0]
            }

        }
        findSecondPCA(tdata[0],firstPCAType,dataFinal)
        findSecondPCA(tdata[1],firstPCAType,dataFinal)
    }

}

//This function will be responsible for extracting the branches coming off from the Basilar arteries


function findBasilarBranches()
{
    //Push basilar extension
    // Concat works better
     basilarExtension=basilarExtension.concat(basilarBranchesParent.childs)

    //To find the right child to traverse we need to check both the children and type of their children
    child1=basilarBranchesParent.children[0]
    child2=basilarBranchesParent.children[1]

    if(child1.children[0].type==0 && child1.children[1].type==0)
    {
        basilarBranch=child1

        //opposite of basilarbranch is the basilar extension, we will push to the BasilarExtension the oppposite child
        basilarExtension=basilarExtension.concat(child2.childs)

    }
    else
    {
        basilarBranch=child2

        //opposite of basilarbranch is the basilar extension, we will push to the BasilarExtension the oppposite child

        basilarExtension=basilarExtension.concat(child1.childs)
    }
    recursivelyFindLargestRadius(basilarBranch,basilarBranch,1)
    checkTheLargestObject()
}

// an array to store all the basilar arteries


function recursivelyFindLargestRadius(basilarData,parent,index)
{
    var tdata=basilarData.children

    if(tdata[0].children!=undefined  )
    {
       // basilarExtension=basilarExtension.concat(tdata[0].childs)
        recursivelyFindLargestRadius(tdata[0],basilarData,1)
    }
    else
    {

        //This stores all the corresponding child node of the
        //If 0th node is basilar and then same 1st node is one of the branches of the child
        storeRadius.push(parseFloat(tdata[0].radius))
        currentBranch.push(tdata[0])
        storeObject.push(tdata[1])
        storeParent.push(parent.children[index])
        //basilarExtension=basilarExtension.concat(parent.childs)
        // basilarExtension=pushElementsinArray(parent.childs,basilarExtension)


    }
    if(tdata[1].children!=undefined  )
    {
        //basilarExtension=basilarExtension.concat(tdata[1].childs)

        recursivelyFindLargestRadius(tdata[1],basilarData,0)
    }
    else
    {
        storeRadius.push(parseFloat(tdata[1].radius))
        currentBranch.push(tdata[1])
        storeObject.push(tdata[0])
        storeParent.push(parent.children[index])
       // basilarExtension=basilarExtension.concat(parent.childs)
        // basilarExtension=pushElementsinArray(parent.childs,basilarExtension)

    }


}

function checkTheLargestObject()
{
    var max=-1
    var index=-1
    for (var i=0;i<storeRadius.length;i++)
    {
        if(storeRadius[i]>max){
            max=storeRadius[i]
            index=i
        }
    }

    firstBasilar=storeObject[index]
    secondBasilar=storeParent[index]


    //Basilar artery has three parts : the root part which is stored in currentBranch, then two branches which connect further PCA's will be stored in the basilarExtension
    basilarBranchids=currentBranch[index].childs

    for(var i=0;i<basilarExtension.length;i++)
    {
        basilarBranchids.push(basilarExtension[i])
    }


    basilarData={
        name :1000,
        type:0,
        children:[firstBasilar,{},{},secondBasilar]
    }
}


//With the global arteries and PCA's we have successfully extracted all the major branches of the artery
//Next step involves arranging the arteries to take care of the left right orientation
//If the PCA is left sided then the connecting artery should be 0 child and PCA should be one or vice versa




function createDataforPCA()
{
    //We need to know if the PCA is
    //since we know the direction of secondIC we can determine how the secondPCA branch should align

    //The direction of PCA's are dependent on the direction of IC's
    var firstPCA
    ///console.log("test log")
   // console.log(globalFirstIC.direction)
    if(globalFirstIC.direction=="left")
    {
        firstPCA={
            name :1000,
            type:0,
            children:[globalFirstPCAArtery,globalFirstPCA]
        }
    }
    else{
        firstPCA={
            name :1000,
            type:0,
            children:[globalFirstPCA,globalFirstPCAArtery]
        }

    }


    var secondPCA;

    //console.log("test log")
    //console.log(globalSecondIC.direction)
    if(globalSecondIC.direction=="left")
    {
        secondPCA={
            name :1000,
            type:0,
            children:[globalSecondArteryPCA,globalSecondPCA]
        }
    }
    else{
        secondPCA={
            name :1000,
            type:0,
            children:[globalSecondPCA,globalSecondArteryPCA]
        }
    }


    // we need to swap children do it brute force and fix it later after meeting
    // the logic is if the children on side  1 are undefined, then left side part should be swapped or else right side should be swapped

    globalFirstPCAArtery.children=[globalFirstIC]
    globalSecondArteryPCA.children=[globalSecondIC]

    //Left-right just says which side of scan it is.
    //
    if(globalSecondIC.direction=="left"){
        visualizationData={
            name :10000,
            type:0,
            children:[secondPCA,firstPCA]
        }
    }
    else{
        visualizationData={
            name :10000,
            type:0,
            children:[firstPCA,secondPCA]
        }
    }

    //console.log(visualizationData)

}


//Part two of the work, embedding the template visualization
//Before this Visualization Data creates a version where we have IC's tree diagram, next we will write code to
//First task here is to bring all three branches at the same level

function newTemplate()
{
    if(globalFirstIC.direction=="left")

    {
        //console.log(globalFirstIC['childArray'])

       // console.log(globalFirstIC['childArray']['children']);
        //console.log(globalFirstIC['childArray']['children']);
        let temp = globalFirstIC['childArray']['children'][1]
        globalFirstIC['childArray']['children'][1] = globalFirstIC['childArray']['children'][0];
        globalFirstIC['childArray']['children'][0] = temp
       // console.log(globalFirstIC['childArray']['children']);

        //console.log(globalFirstPCA)

        arraytoStoreChildValsFirstPCA.push(globalFirstIC['childArray']);
        arraytoStoreChildValsFirstPCA.push(globalFirstPCA);
    }
    else
    {
        //console.log(globalFirstIC['childArray']['children']);
        let temp = globalFirstIC['childArray']['children'][0]
        globalFirstIC['childArray']['children'][0] = globalFirstIC['childArray']['children'][1];
        globalFirstIC['childArray']['children'][1] = temp
        arraytoStoreChildValsFirstPCA.push(globalFirstPCA)
        arraytoStoreChildValsFirstPCA.push(globalFirstIC['childArray'])
    }
    if(globalSecondIC.direction=="left")
    {
       // console.log(globalSecondIC['childArray']['children']);
       // console.log(globalSecondIC['childArray']['children']);
        let temp = globalSecondIC['childArray']['children'][0]
        globalSecondIC['childArray']['children'][0] = globalSecondIC['childArray']['children'][1];
        globalSecondIC['childArray']['children'][1] = temp
        //console.log(globalSecondIC['childArray']['children']);

        arraytoStoreChildValsSecondPCA.push(globalSecondIC['childArray'])
        arraytoStoreChildValsSecondPCA.push(globalSecondPCA)
    }
    else
    {
        //console.log(globalSecondIC['childArray']['children']);
        let temp = globalSecondIC['childArray']['children'][0]
        globalSecondIC['childArray']['children'][0] = globalSecondIC['childArray']['children'][1];
        globalSecondIC['childArray']['children'][1] = temp
       // console.log(globalSecondIC['childArray']['children']);
        arraytoStoreChildValsSecondPCA.push(globalSecondPCA)
        arraytoStoreChildValsSecondPCA.push(globalSecondIC['childArray'])
    }
    if(globalSecondIC.direction=="left")
    {
        //This code is for template
        arraytoStoreChildVals.push(arraytoStoreChildValsSecondPCA[0]);
        arraytoStoreChildVals.push(arraytoStoreChildValsSecondPCA[1]);
        arraytoStoreChildVals.push(arraytoStoreChildValsFirstPCA[0]);
        arraytoStoreChildVals.push(arraytoStoreChildValsFirstPCA[1]);
    }
    else
    {
        //This code is for template
        arraytoStoreChildVals.push(arraytoStoreChildValsFirstPCA[0]);
        arraytoStoreChildVals.push(arraytoStoreChildValsFirstPCA[1]);
        arraytoStoreChildVals.push(arraytoStoreChildValsSecondPCA[0]);
        arraytoStoreChildVals.push(arraytoStoreChildValsSecondPCA[1]);
    }

    //This switching of data ensures that left and right side of the brain are exchanged
    let temparraytoStoreChildVals = arraytoStoreChildVals[0];
    arraytoStoreChildVals[0] = arraytoStoreChildVals[3];
    arraytoStoreChildVals[3] = temparraytoStoreChildVals;

    temparraytoStoreChildVals = arraytoStoreChildVals[1];
    arraytoStoreChildVals[1] = arraytoStoreChildVals[2];
    arraytoStoreChildVals[2] = temparraytoStoreChildVals;


    //temp addition to check for Basilar arteries

    visualizationData={
        name :10000,
        type:0,
        children:arraytoStoreChildVals
    }



    //console.log(visualizationData)

}

//This function will just return the
function findChildforIC(data) {
    var children = data.children

    if (children[0].children != undefined) {
        var secondLevelChildren = children[0].children
        if (secondLevelChildren.length == 1) {
            return secondLevelChildren[0]
        }
        else {
            return children[0]
        }
    }

    if (children[1].children != undefined) {

        var secondLevelChildren = children[1].children
        if (secondLevelChildren.length == 1) {
            return secondLevelChildren[0]
        }
        else {
            return children[1]
        }

    }
}

// There are multiple times we have to push elements of an array into a storage array, we design this function to perform this operation whenever required
//the function will take two inputs : 1. The array of elements to push(source) 2. The array to be pushed to (destination)
//We need to check if the destination array will update the original array which is passed by reference
