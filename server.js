var express = require('express');
var app = express();
var server = require('http').Server(app);


// ---- BONJOUR-BASED PANEL COMMUNICATION --------------------------------------
// initialize bonjour panel manager
var {BonjourPanelManager} = require('./modules/bonjourPanelManager.js');
var panelManager = new BonjourPanelManager();
// ---- END BONJOUR-BASED PANEL COMMUNICATION ----------------------------------

// (or)

// ---- ARDUINO SERIAL-BASED PANEL COMMUNICATION -------------------------------
// initialize arduino panel manager
// var ArduinoPanelManager = require('./modules/arduinoPanelManager.js');
// var panelManager = new ArduinoPanelManager('/dev/ttyS3', 9600);
// ---- END ARDUINO SERIAL-BASED PANEL COMMUNICATION ---------------------------



// ---- SOCKET SERVER: LISTENS FOR COMMANDS FROM CONTROLLER GUI ----------------
// initialize socket server
var io = require('socket.io')(server);
var socket = undefined;
io.on('connection', (newSocket) => { 
    socket = newSocket
    newSocket.on('render', (ledMatrix) => {
        console.log('socket.render', ledMatrix)
        panelManager.send(ledMatrix);
    });
});



// ---- LAUNCHPAD CONTROLLER ----------------------------------------------------
//// initialize launchpad controller
//var LaunchpadController = require('./modules/launchpad.js');
//var launchpad = new LaunchpadController('./sequences/');
//launchpad.on('sequence', (sequence, sequenceFilename) => {
//    console.log('launchpad.sequence', sequenceFilename);
//    if(socket) { socket.emit('sequence', sequence); }
//});
//launchpad.on('configuration', (configuration) => {
//    console.log('launchpad.configuration', configuration);
//    if(socket) { socket.emit('configuration', configuration); }
//});
// ---- END LAUNCHPAD CONTROLLER -----------------------------------------------



// ---- CONTROLLER GUI WEB SERVER ----------------------------------------------
// initialize web server
app.set('view engine', 'ejs')
app.use(express.static(__dirname));
app.get('/', (req, res) => { res.render('index'); });
var port = process.argv[2] || 3000;
server.listen(port, () => console.log(`Controller listening on port ${port}!`));
// ---- END CONTROLLER GUI WEB SERVER ------------------------------------------
