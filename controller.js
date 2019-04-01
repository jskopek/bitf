var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var bonjour = require('bonjour')();

var LaunchpadController = require('./modules/launchpad.js');

app.use(express.static(__dirname));
app.get('/', (req, res) => { res.sendFile('index.html'); });
var port = process.argv[2] || 3000;

server.listen(port, () => console.log(`Controller listening on port ${port}!`));

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
var browser = bonjour.find({type: 'panel'}, (service) => {
    var address = service.referer.address;
    var port = service.port;
    var offsetRow = parseInt(service.txt.offsetrow) || 0;
    var offsetCol = parseInt(service.txt.offsetcol) || 0;
    console.log('Found Panel!', address, port, offsetRow, offsetCol);
    if(socket) { socket.emit('panel', address, port, offsetRow, offsetCol); }
});
