const Launchpad = require('launchpad-mini');
const fs = require('fs');
const path = require('path');

var app = require('http').createServer();
var io = require('socket.io')(app);
app.listen(4000);
var socket = undefined;
io.on('connection', (newSocket) => { socket = newSocket; });

pad = new Launchpad();

var files = fs.readdirSync('.');
files = files.filter((file) => { return path.extname(file) == '.json'; });

var btnFileDict = {};
files.forEach((file, i) => {
    var col = i % 8;
    var row = (i - col) / 8;
    btnFileDict[JSON.stringify([col,row])] = file;
});
 
pad.connect().then(() => {
    console.log('Pad Connected');
    pad.reset();

    for(var btnPos in btnFileDict) { pad.col(pad.red, JSON.parse(btnPos)); }

    pad.on('key', key => {
        if(!pad.isPressed(key)) { return; }
        else if(!socket) { return; }

        if((key.x == 8) || (key.y == 8)) {
            if(key.x == 8) {
                console.log('Configuration - microphone');
                socket.emit('configuration', {'type': 'microphone', 'level': (8 - key.y) / 8});
            } else {
                console.log('Configuration - sequencer');
                socket.emit('configuration', {'type': 'sequencer', 'level': (key.x + 1) / 8});
            }

            // reset lights
            for(var y = 0; y < 8; y++) { pad.col(pad.off, [8,y]); }
            for(var x = 0; x < 8; x++) { pad.col(pad.off, [x,8]); }
        } else {
            var file = btnFileDict[JSON.stringify([key.x, key.y])];
            if(!file) { return; }

            console.log('Sequence Presed', file);
            var sequence = JSON.parse(fs.readFileSync(file));
            socket.emit('sequence', sequence);

            // set color
            for(var btnPos in btnFileDict) { pad.col(pad.red, JSON.parse(btnPos)); }
        }

        // set active color
        pad.col(pad.green.full, key);
    });
});
