var express = require('express');
var cors = require('cors');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var bonjour = require('bonjour')();
var opn = require('opn');

app.use(express.static('static'));
app.use(cors());

var socket = undefined;
io.on('connection', (newSocket) => { socket = newSocket; });

app.get('/push/', (req, res) => {
    var colors = JSON.parse(req.query.colors);
    if(!socket) {
        console.log('Panel is not online');
    } else {
        socket.emit('colors', colors); 
        console.log('Panel updated');
    }
    res.send('ok!');
});

var port = process.argv[2] || 3001;
var offsetCol = process.argv[3] || 0;
var offsetRow = process.argv[4] || 0;
server.listen(port, () => console.log(`Panel listening on port ${port}!`));

bonjour.publish({
    name: 'Panel ID' + Math.floor(Math.random() * 100),
    type: 'panel', 
    port: port,
    txt: {
        offsetrow: offsetRow,
        offsetcol: offsetCol
    }
});

opn(`http://localhost:${port}`);
