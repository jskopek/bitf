const path = require('path');

module.exports = {
    entry: {
        'controller': './static/controller.js',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].bundle.js'
    },
    mode: 'development'
    //watch: true
};
