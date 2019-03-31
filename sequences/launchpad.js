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
console.log(files);

var btnFileDict = {};
files.forEach((file, i) => {
    var col = i % 8;
    var row = (i - col) / 8;
    btnFileDict[JSON.stringify([col,row])] = file;
});
 
pad.connect().then(() => {
    pad.reset();

    for(var btnPos in btnFileDict) { pad.col(pad.red, JSON.parse(btnPos)); }

    pad.on('key', key => {
        if(!pad.isPressed(key)) { return; }
        var file = btnFileDict[JSON.stringify([key.x, key.y])];
        if(!file) { return; }
        console.log(file);
        var sequence = JSON.parse(fs.readFileSync(file));
        if(socket) { socket.emit('sequence', sequence); }


        for(var btnPos in btnFileDict) { pad.col(pad.red, JSON.parse(btnPos)); }
        pad.col(pad.green, key);

        //pad.col(k.pressed ? pad.red : pad.green, k);
    });
});
