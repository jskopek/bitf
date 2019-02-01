require('dotenv').config()
const Pusher = require('pusher');
const express = require('express');
const app = express()
const port = 3000

app.set('view engine', 'ejs');

app.get('/viewer/', (req, res) => res.render('viewer'));
app.get('/controller/', (req, res) => res.render('controller'));
app.get('/', (req, res) => res.render('index'));

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
