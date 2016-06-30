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

    if (salary > 0 && salary < results[0][filingType] ) {
      connection.query('SELECT `tax_rate` FROM `federal_tax`', function (error, resultsRate, fields) {
          let details = {taxOwed: salary * resultsRate[0].tax_rate};
          res.json(details);

        })
    }


/*

    for (let i = 1; i < 7; i++) {
      if (salary > results[i][filingType]) {
        connection.query('SELECT `tax_rate` FROM `federal_tax`', function (error, results, fields) {
            taxOwed = results[i][filingType] * results[i].tax_rate

          })
      }
      connection.query('SELECT `tax_rate` FROM `federal_tax`', function (error, results, fields) {
          taxOwed =  (salary - results[i][filingType]) * results[i].tax_rate

        })
    }


*/






  });

}
