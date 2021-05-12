/**
 * Created by harshshukla on 07/11/17.
 */
var config = {
    apiKey: "AIzaSyDF2Sx3zlvgREAi_gV7NWwOxsNqxgs1Tes",
    authDomain: "strokevisualization.firebaseapp.com",
    databaseURL: "https://strokevisualization.firebaseio.com",
    projectId: "strokevisualization",
    storageBucket: "strokevisualization.appspot.com",
    messagingSenderId: "456731215577"
};
firebase.initializeApp(config);

var database = firebase.database();
var indexOfItem=0
var datapoint

//Reading data file from the server
//This function is called in the orthographic_projection.js
function readdata(param) {
    //BG0003
   datapoint=firebase.database().ref('/Points/'+param).once('value').then(function(snapshot) {
   return snapshot.val()
})
return datapoint
}

//Input: Filename appended with color code
//Output: ID, Gender, Sex
async function readMetaData(fileName) {

    let promise = new Promise((resolve, reject) => {

        d3.csv("data/metadata.csv",function(data){
            let objectData = convertArrayToObj(data, "PID");
            resolve(objectData[fileName])
        })

        //  setTimeout(() => resolve("done!"), 1000)
    });

    let result = await promise; // wait till the promise resolves (*)

    populateMetaData(result)
}


//Desc: Converts an array of objects to objects
// Input: Array, objectId
//Output: Dictionary indexed on the

function convertArrayToObj(array, objId)
{
    let objFinal = {};

    array.forEach(function(d){

        var index = d[objId]
        objFinal[index] = d;
        // objFinal[objId] = d;

    })

    return objFinal;
}

//Desc: Loading MetaData into the correct span
//Input: result from metadata function
function populateMetaData(result)
{
    let id = document.getElementById('metaInformationID');
    id.innerHTML = "PID: "+result["PID"];
    let age = document.getElementById('metaInformationAge');
    age.innerHTML = "Age: "+result["Age"];
    let sex = document.getElementById('metaInformationSex');
    sex.innerHTML = "Sex: "+result["Gender"];
}

function updateData(param1,param2)
{
    console.log("coming")
    firebase.database().ref('/Test/'+param1).update({booleanval:param2})
}

//Desc: Reading stenosis data, for evaluation
//Input: FileName
//Output: Stenosis Data
async function readStenosisData(fileName)
{
    let promise = new Promise((resolve, reject) => {

        d3.csv("data/Stenosis.csv",function(data){
            let objectData = convertArrayToObj(data, "File");
            resolve(objectData[fileName]);
        });
    });

    let result

    if( result = await promise){
        return result
    }; // wait till the promise resolves (*)

}

//Desc: Reading aneurysm data, for evaluation
//Input: FileName
//Output: Stenosis Data
async function readAneurysmData(fileName)
{
    let promise = new Promise((resolve, reject) => {

        d3.csv("data/Aneurysm.csv",function(data){
            let objectData = convertArrayToObj(data, "File");
            resolve(objectData[fileName]);
        });
    });

    let result

    if( result = await promise){
        return result
    }; // wait till the promise resolves (*)

}

//Weird dataset
//BG0014
//BG0002 : width/radius not working
//
//readdata()

function readAllData()
{
    datapoint=firebase.database().ref('/Points').once('value').then(function(snapshot)
    {
        console.log(snapshot.val())
        return snapshot.val()
    })
    return datapoint
}

//readAllData()



//Writing Data to the server
function writeUserData(data,fileList,updateStep) {
    //console.log(fileList[indexOfItem])

    firebase.database().ref("Points/"+fileList[indexOfItem].split(".")[0]).set(data);

    indexOfItem=indexOfItem+updateStep
}




//Generic write function

function writeOneFile(data,filename){

firebase.database().ref("Points/"+filename.split(".")[0]).set(data);
}



//Deleting all data under a reference from Firebase
// function deleteAllData(fileList)
// {
//     firebase.database().ref().child(fileList[indexOfItem].split(".")[0]).remove()
// }

//Writing Files in Batch
//File Loader function
// $.get("testdata", function(data)
// {
//     $("#fileNames").append(data);
//     list=$( "#fileNames" ).text()
//     elongatedList=list.split("\n")
//     fileList=elongatedList.slice(6,elongatedList.length-5)
//
//     //Creating swc objects
//     generateSWCobjects(fileList)
// });
//
// // //Generate SWC objects
// function generateSWCobjects(fileList){
//     var updateStep=1// Keeps track
//     //Reading all the alternate only color coded files to convert
//     for (var i=0;i<fileList.length;i=i+updateStep){
//         $.get("testdata/"+fileList[i], function(data) {
//             swcdata=swc_parser(data)
//             //console.log(swcdata)
//            // writeUserData(swcdata,fileList,updateStep)
//             // console.log(swcdata)
//             //Storing the files on Firbase
//
//         }, 'text');
//     }
// }
//
//
//
// // Get the swc data from any file that is passed to this file
// //Writing one file at a time
// function getfileData_StoreFirebase(path,filename)
// {
//
//       var swcObject= $.get(path+filename, function(data) {
//             swcdata=swc_parser(data)
//             //console.log(swcdata)
//              writeOneFile(swcdata,filename)
//         }, 'text');
//
//     return swcObject
// }


// getfileData_StoreFirebase("testdata/","test.swc")


//Read the parameters from the URL of the website



