var express = require('express');
var app = express();
var server = require('http').Server(app);
app.use(express.static(__dirname));
app.get('/', (req, res) => { res.sendFile('index.html'); });
var port = process.argv[2] || 3000;

server.listen(port, () => console.log(`Controller listening on port ${port}!`));
