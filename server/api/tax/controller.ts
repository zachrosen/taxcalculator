import * as express from "express";
import * as mysql from "mysql";

var connection = mysql.createConnection({
  //properties
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'taxDB'
});



export function multiply5 (req: express.Request, res: express.Response, next) {
let filingType = req.body.filingType;
let salary = req.body.salary;


  connection.query('SELECT `'+filingType+'` FROM `federal_tax`', function (error, results, fields) {

  console.log(results[0][filingType]);

  let details = {salary: salary}

    res.json(details);

});
}
