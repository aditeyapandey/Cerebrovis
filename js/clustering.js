/**
 * Created by aditeyapandey on 1/21/19.
 */

function getClusters(data, options) {

    var numberOfClusters, distanceFunction, vectorFunction, minMaxValues, maxIterations;

    if (!options || !options.numberOfClusters) { numberOfClusters = getNumberOfClusters(data.length); }
    else { numberOfClusters = options.numberOfClusters; }

    if (!options || !options.distanceFunction) { distanceFunction = getDistance; }
    else { distanceFunction = options.distanceFunction; }

    if (!options || !options.vectorFunction) { vectorFunction = defaultVectorFunction; }
    else { vectorFunction = options.vectorFunction; }

    if (!options || !options.maxIterations) { maxIterations = 1000; }
    else { maxIterations = options.maxIterations; }


    var numberOfDimensions = getNumnerOfDimensions(data, vectorFunction);

    minMaxValues = getMinAndMaxValues(data, numberOfDimensions, vectorFunction);

    return getClustersWithParams(data, numberOfDimensions, numberOfClusters, distanceFunction, vectorFunction, minMaxValues, maxIterations).clusters;
}


function getClustersWithParams(data, numberOfDimensions ,numberOfClusters, distanceFunction, vectorFunction, minMaxValues, maxIterations) {

    var means = createRandomMeans(numberOfDimensions, numberOfClusters, minMaxValues);

    var clusters = createClusters(means);

    var prevMeansDistance = 999999;

    var numOfInterations = 0;
    var iterations = [];


    while(numOfInterations < maxIterations) {

        initClustersData(clusters);

        assignDataToClusters(data, clusters, distanceFunction, vectorFunction);

        updateMeans(clusters, vectorFunction);

        var meansDistance = getMeansDistance(clusters, vectorFunction, distanceFunction);

        //iterations.push(meansDistance);
        //console.log(numOfInterations + ': ' + meansDistance);
        numOfInterations++;
    }

    //console.log(getMeansDistance(clusters, vectorFunction, distanceFunction));

    return { clusters: clusters, iterations: iterations };
}

function defaultVectorFunction(vector) {
    return vector;
}

function getNumnerOfDimensions(data, vectorFunction) {
    if (data[0]) {
        return vectorFunction(data[0]).length;
    }
    return 0;
}

function getNumberOfClusters(n) {
    return Math.ceil(Math.sqrt(n/2));
}

function getMinAndMaxValues(data, numberOfDimensions, vectorFunction) {

    var minMaxValues = initMinAndMaxValues(numberOfDimensions);

    data.forEach(function (vector) {

        for (var i = 0; i < numberOfDimensions; i++) {

            if (vectorFunction(vector)[i] < minMaxValues.minValue[i]) {
                minMaxValues.minValue[i] = vectorFunction(vector)[i];
            }

            if(vectorFunction(vector)[i] > minMaxValues.maxValue[i]) {
                minMaxValues.maxValue[i] = vectorFunction(vector)[i];
            }
        };
    });


    return minMaxValues;
}


function initMinAndMaxValues(numberOfDimensions) {

    var result = { minValue : [], maxValue : [] }

    for (var i = 0; i < numberOfDimensions; i++) {
        result.minValue.push(9999);
        result.maxValue.push(-9999);
    };

    return result;
}


function printMeans(clusters) {
    var means = '';

    clusters.forEach(function (cluster) {
        means = means + ' [' + cluster.mean + ']'
    });

    //console.log(means);
}

function getMeansDistance(clusters, vectorFunction, distanceFunction) {

    var meansDistance = 0;

    clusters.forEach(function (cluster) {

        cluster.data.forEach(function (vector) {

            meansDistance = meansDistance + Math.pow(distanceFunction(cluster.mean, vectorFunction(vector)), 2);
        });
    });


    return meansDistance;
}

function updateMeans(clusters, vectorFunction) {

    clusters.forEach(function (cluster) {
        updateMean(cluster, vectorFunction);

    });
}


function updateMean(cluster, vectorFunction) {

    var newMean = [];

    for (var i = 0; i < cluster.mean.length; i++) {
        newMean.push(getMean(cluster.data, i, vectorFunction));
    };


    cluster.mean = newMean;

}

function getMean(data, index, vectorFunction) {
    var sum =  0;
    var total = data.length;

    if(total == 0) return 0;

    data.forEach(function (vector) {

        sum = sum + vectorFunction(vector)[index];
    });


    return sum / total;
}

function assignDataToClusters(data, clusters, distanceFunction, vectorFunction) {


    data.forEach(function (vector) {
        var cluster = findClosestCluster(vectorFunction(vector), clusters, distanceFunction);

        if(!cluster.data) cluster.data = [];

        cluster.data.push(vector);
    });
}


function findClosestCluster(vector, clusters, distanceFunction) {

    var closest = {};
    var minDistance = 9999999;

    clusters.forEach(function (cluster) {

        var distance = distanceFunction(cluster.mean, vector);
        if (distance < minDistance) {
            minDistance = distance;
            closest = cluster;
        };
    });

    return closest;
}

function initClustersData(clusters) {
    clusters.forEach(function (cluster) {
        cluster.data = [];
    });
}

function createClusters(means) {
    var clusters = [];

    means.forEach(function (mean) {
        var cluster = { mean : mean, data : []};

        clusters.push(cluster);
    });

    return clusters;
}

function createRandomMeans(numberOfDimensions, numberOfClusters, minMaxValues) {

    var means = [];

    for (var i = 0; i < numberOfClusters; i++) {
        means.push(createRandomPoint(numberOfDimensions, minMaxValues.minValue[i], minMaxValues.maxValue[i]));
    };

    return means;
}

function createRandomPoint(numberOfDimensions, minValue, maxValue) {
    var point = [];

    for (var i = 0; i < numberOfDimensions; i++) {
        point.push(random(minValue, maxValue));
    };

    return point;
}

function random (low, high) {

    return Math.random() * (high - low) + low;
}

function getDistance(vector1, vector2) {
    var sum = 0;

    for (var i = 0; i < vector1.length; i++) {
        sum = sum + Math.pow(vector1[i] - vector2[i],2)
    };

    return Math.sqrt(sum);

}
