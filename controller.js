var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var bonjour = require('bonjour')();

var LaunchpadController = require('./modules/launchpad.js');

// initialize socket server
var socket = undefined;
io.on('connection', (newSocket) => { socket = newSocket; });

// initialize launchpad controller
var launchpad = new LaunchpadController('./sequences/');
launchpad.on('sequence', (sequence, sequenceFilename) => {
    console.log('launchpad.sequence', sequenceFilename);
    if(socket) { socket.emit('sequence', sequence); }
});
launchpad.on('configuration', (configuration) => {
    console.log('launchpad.configuration', configuration);
    if(socket) { socket.emit('configuration', configuration); }
});

// monitor for new panels being broadcast on bonjour
var panels = [];
var browser = bonjour.find({type: 'panel'}, (service) => {
    var panelData = {
        'address': service.referer.address,
        'port': service.port,
        'offsetRow': parseInt(service.txt.offsetrow) || 0,
        'offsetCol': parseInt(service.txt.offsetcol) || 0
    };
    panels.push(panelData);
    console.log('Found Panel!', panelData);
    if(socket) { socket.emit('panel', panelData); }
});

// initialize web server
app.set('view engine', 'ejs')
app.use(express.static(__dirname));
app.get('/', (req, res) => { res.render('index', {'panels': panels}); });
var port = process.argv[2] || 3000;
server.listen(port, () => console.log(`Controller listening on port ${port}!`));


