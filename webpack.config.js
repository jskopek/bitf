const path = require('path');

module.exports = {
    entry: {
        'bitf': './bitf.js',
        'viewer': './viewer.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].bundle.js'
    },
    mode: 'development',
    watch: true
};
