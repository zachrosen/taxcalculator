require('dotenv').config({ silent: true });

// Imports
import * as express from "express";
import config = require('./config/config');
import * as mysql from "mysql";

//Global Vars
const PORT = process.env.PORT || 3000;
let app = express();

//MySQL Connection
//require('./api/tax/model');
var connection = mysql.createConnection({
  //properties
  host: 'sql3.freesqldatabase.com',
  user: 'sql3127728',
  password: '4nqnXFwiSH',
  database: 'sql3127728'
});

connection.connect(function(error) {
  if(!!error) {
    console.log("Error");
  } else {
    console.log("Connected")
  }

});

//Routes config
app.use(require('body-parser')());
// access bower_components via /scripts/...
app.use('/bower_components', express.static('bower_components'));
// access the client->app->home folder via /app/home
app.use('/client', express.static('client'));

// Routes
app.get('/', (req, res, next) => {
  res.sendFile(config.client + '/index.html');
});
app.use('/api/v1/tax', require('./api/tax/routes'));


// if path start with /client, /bower_components, or /api, send a 404
app.get(/\/(client|bower_components|api).{0,}/, (req, res, next) => {
  next({ status: 404, message: `${req.path} is not found or does not exist. Please check for typos.` });
});

// all other get calls, ex: /adopt, send the index.html and let angular take care of the routing
app.get('/*', (req, res, next) => {
  res.sendFile(config.client + '/index.html');
});

app.use((req, res, next) => {
  return next({ status: 404 , message: `${req.method}: ${req.path} is not found.` });
});

app.use((err: any, req, res, next) => {
  if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'production')
    console.log(err);
  if (process.env.NODE_ENV === 'production')
    err = { status: err.status || 500, message: err.message || '' };
  res.status(err.status).send(err);
})

app.use((req, res, next) => {
  res.sendStatus(404);
});

app.use((err: any, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).send(err);
})

// Listen
app.listen(PORT, () => {
  console.log('Server is listening on localhost:3000');
});
