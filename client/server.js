var express = require('express');
var cors = require('cors');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(express.static('static'));
app.use(cors());

var socket = undefined;
io.on('connection', (newSocket) => { socket = newSocket; });

app.get('/push/', (req, res) => {
    console.log('colors received', req.query.colors);
    var colors = JSON.parse(req.query.colors);
    socket.emit('colors', colors);
    res.send('ok!');
});

var port = process.argv[2] || 3001;
server.listen(port, () => console.log(`App listening on port ${port}!`));
