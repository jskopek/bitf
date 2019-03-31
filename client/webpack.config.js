const path = require('path');

module.exports = {
    entry: {
        'client': './static/client.js'
    },
    output: {
        path: path.resolve(__dirname, 'static', 'dist'),
        filename: '[name].bundle.js'
    },
    mode: 'development'
    //watch: true
};
