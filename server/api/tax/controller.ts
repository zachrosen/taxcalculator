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
let taxOwed = 0;

  connection.query('SELECT `'+filingType+'` FROM `federal_tax`', function (error, results, fields) {

if(salary < results[0][filingType]) {
  connection.query('SELECT `tax_rate` FROM `federal_tax`', function (error, results, fields) {
    let details = {salary: salary * results[0].tax_rate}
      res.json(details);
  })
} else if (results[0][filingType] < salary && salary < results[1][filingType]) {
  let newSalary = salary - 9275
  let details = {salary: 927.5 + (newSalary * 0.15)}
    res.json(details);
}


  });

}
