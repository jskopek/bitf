const path = require('path');

module.exports = {
    entry: './bitf.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bitf.bundle.js'
    },
    mode: 'development',
    watch: true
};
