const express = require('express');
const app = express()
const port = 3000
app.get('/', (req, res) => res.send('hello world'));
app.use(express.static('static'))
app.listen(port, () => console.log(`App listening on port ${port}!`));
