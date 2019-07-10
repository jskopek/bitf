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


module.exports = { valuesToMatrix, duplicateValues }
