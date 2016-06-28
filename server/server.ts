require('dotenv').config({ silent: true });

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
  connection.query('CREATE TABLE people(id int primary key, name varchar(255), age int, address text)', function(err, result) {
  if (err) throw err
  connection.query('INSERT INTO people (name, age, address) VALUES (?, ?, ?)', ['Larry', '41', 'California, USA'], function(err, result) {
    if (err) throw err
    connection.query('SELECT * FROM people', function(err, results) {
      if (err) throw err
      console.log(results[0].id)
      console.log(results[0].name)
      console.log(results[0].age)
      console.log(results[0].address)
    })
  })
})

});




app.listen(3000);
