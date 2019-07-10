var express = require('express');
var app = express();
var server = require('http').Server(app);


// ---- BONJOUR-BASED PANEL COMMUNICATION --------------------------------------
var {BonjourPanelManager} = require('./modules/bonjourPanelManager.js');
var panelManager = new BonjourPanelManager(2, 4);
// ---- END BONJOUR-BASED PANEL COMMUNICATION ----------------------------------

// (or)

// ---- ARDUINO SERIAL-BASED PANEL COMMUNICATION -------------------------------
//var ArduinoPanelManager = require('./modules/arduinoPanelManager.js');
//var panelManager = new ArduinoPanelManager({
//    path: '/dev/ttyS3', 
//    baudRate: 9600, 
//    ledsPerPanel: 2
//});
// ---- END ARDUINO SERIAL-BASED PANEL COMMUNICATION ---------------------------



// ---- SOCKET SERVER: LISTENS FOR COMMANDS FROM CONTROLLER GUI ----------------
// initialize socket server
var io = require('socket.io')(server);
var socket = undefined;
io.on('connection', (newSocket) => { 
    socket = newSocket
    socket.on('render', (panelColorsArray) => {
        console.log('socket.render', panelColorsArray);
        panelManager.send(panelColorsArray);
    });
//    newSocket.on('render', (ledMatrix) => {
//        console.log('socket.render', ledMatrix)
//        panelManager.send(ledMatrix);
//    });
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
