"use strict";
require('dotenv').config({ silent: true });
var express = require("express");
var config = require('./config/config');
var mysql = require("mysql");
var PORT = process.env.PORT || 3000;
var app = express();
var connection = mysql.createConnection({
    host: 'sql3.freesqldatabase.com',
    user: 'sql3127728',
    password: '4nqnXFwiSH',
    database: 'sql3127728'
});
connection.connect(function (error) {
    if (!!error) {
        console.log("Error");
    }
    else {
        console.log("Connected");
    }
});
app.use(require('body-parser')());
app.use('/bower_components', express.static('bower_components'));
app.use('/client', express.static('client'));
app.get('/', function (req, res, next) {
    res.sendFile(config.client + '/index.html');
});
app.use('/api/v1/tax', require('./api/tax/routes'));
app.get(/\/(client|bower_components|api).{0,}/, function (req, res, next) {
    next({ status: 404, message: req.path + " is not found or does not exist. Please check for typos." });
});
app.get('/*', function (req, res, next) {
    res.sendFile(config.client + '/index.html');
});
app.use(function (req, res, next) {
    return next({ status: 404, message: req.method + ": " + req.path + " is not found." });
});
app.use(function (err, req, res, next) {
    if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'production')
        console.log(err);
    if (process.env.NODE_ENV === 'production')
        err = { status: err.status || 500, message: err.message || '' };
    res.status(err.status).send(err);
});
app.use(function (req, res, next) {
    res.sendStatus(404);
});
app.use(function (err, req, res, next) {
    console.error(err);
    res.status(err.status || 500).send(err);
});
app.listen(PORT, function () {
    console.log('Server is listening on localhost:3000');
});
