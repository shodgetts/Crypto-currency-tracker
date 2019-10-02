const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3001;
const controller = require('./controller');

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);

app.use(cors());

app.use(express.static(path.join(__dirname, '../public/client/dist/')));

app.get('/cryptoData/:date', controller.getData)
app.post('/cryptoData/:date', controller.postData)

app.listen(port, () => console.log(`listening on ${port}`));
