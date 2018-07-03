require('./config/config');

const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use( require('./routes/search') );
app.listen(process.env.PORT, () => {
    console.log('Listening ', process.env.PORT)
});
