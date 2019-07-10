function valuesToMatrix(values, rows, cols) {
    // takes a flat array of values (e.g. [1,2,3,4,5,6]) and converts to a matrix of row/col values based on ceiling
    // dimensions (e..g [[1,2,3],[4,5,6]])
    var matrix = []
    var i = 0;
    for(var row = 0; row < rows; row++) {
        matrix.push([]);
        for(var col = 0; col < cols; col++) {
            matrix[row].push(values[i]);
            i++;
        }
    }
    return matrix
}

function groupValuesIntoArrays(values, arraySize) {
    // takes an array of values and groups them into arrays of arraySize
    // e.g. groupValuesIntoArrays([1,2,3,4,5,6,7,8], 3) => [[1,2,3],[4,5,6],[7,8]]
    // primarily used when taking a flat list of [R, G, B, R, G, B] values and grouping into [[R,G,B], [R,G,B]]
    var groupedValues = [];
    var newGroup = [];
    for(var i = 0; i < values.length; i++) {
        newGroup.push(values[i]);
        if(newGroup.length == arraySize) {
            groupedValues.push(newGroup);
            newGroup = []
        }
    }
    if(newGroup.length) {
        groupedValues.push(newGroup);
    }
    return groupedValues;
}

function flattenMatrixOnce(matrix) {
    // takes a matrix of values  and flattens once
    // e.g. (e.g. flattenMatrixOnce([[1,2,3],[4,5,[6,7]]]) => [1,2,3,4,5,[6,7]]
    return [].concat(...matrix);
}

function duplicateValues(values, numTimes) {
    // takes an array of values (or any array) and duplicates each entry numTimes
    // e.g. duplicateValues([1,2,3], 2) => [1,1,2,2,3,3]
    // e.g. duplicateValues([3,2,1], 3) => [3,3,3,2,2,2,1,1,1]

    var newArray = []
    for(var i = 0; i < values.length; i++) {
        for(var j = 0; j < numTimes; j++) {
            newArray.push(values[i]);
        }
    }
    return newArray
}


module.exports = { valuesToMatrix, groupValuesIntoArrays, flattenMatrixOnce, duplicateValues }
