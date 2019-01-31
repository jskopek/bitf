const path = require('path');

module.exports = {
    entry: {
        'bitf': './static/bitf.js',
        'viewer': './static/viewer.js'
    },
    output: {
        path: path.resolve(__dirname, 'static', 'dist'),
        filename: '[name].bundle.js'
    },
    mode: 'development',
    watch: true
};
