var express = require("express");
var mysql = require("mysql");
var app = express();

var connection = mysql.createConnection({
  //properties
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'sampleDB'
});

connection.connect(function(error) {
  if(!!error) {
    console.log("Error");
  } else {
    console.log("Connected")
  }

});




app.listen(3000);
