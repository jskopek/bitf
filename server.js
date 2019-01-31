var Pusher = require('pusher');
require('dotenv').config()
const express = require('express');
const app = express()
const port = 3000
app.get('/', (req, res) => res.send('hello world'));

app.get('/push/', (req, res) => {
    var pusher = new Pusher({
        appId: process.env.app_id,
        key: process.env.key,
        secret: process.env.secret,
        cluster: process.env.cluster
    });

    var sequence = JSON.parse(req.query.sequence);
    pusher.trigger('bitf', 'sequence', sequence);
    res.send('sent!');
});
app.use(express.static('static'))
app.listen(port, () => console.log(`App listening on port ${port}!`));
