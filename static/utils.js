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


module.exports = { valuesToMatrix }
