import * as express from "express";
import * as mysql from "mysql";

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'taxDB'
});


export function preTaxIncome (req: express.Request, res: express.Response, next) {
  req['boobs'] = req.body.salary
  next();
}

export function federalTaxAmount (req: express.Request, res: express.Response, next) {
let filingType = req.body.filingType;
let salary = req.body.salary;
let taxOwed = 0;

  connection.query('SELECT `'+filingType+'` FROM `federal_tax`', function (error, results, fields) {

    if (salary > 0 && salary < results[0][filingType]) {
      connection.query('SELECT `tax_rate` FROM `federal_tax`', function (error, resultsRate, fields) {
          let details = {taxOwed: salary * resultsRate[0].tax_rate};
          //res.json(details);
        })
    }
    if (salary > results[0][filingType]) {
      connection.query('SELECT `tax_rate` FROM `federal_tax`', function (error, resultsRate, fields) {
        let taxOwedNumber = 0;
        taxOwedNumber += results[0][filingType] * resultsRate[0].tax_rate;

          for (let i = 1; i < 7; i++) {
            if (salary > results[i][filingType]) {
              connection.query('SELECT `tax_rate` FROM `federal_tax`', function (error, resultsRate, fields) {
                  taxOwedNumber += (results[i][filingType] - results[i-1][filingType]) * resultsRate[i].tax_rate
              })
            } else {
            connection.query('SELECT `tax_rate` FROM `federal_tax`', function (error, resultsRate, fields) {
                taxOwedNumber += (salary - results[i-1][filingType]) * resultsRate[i].tax_rate;
                req['taxOwed'] = taxOwedNumber;
                next();
              })
              break;

            }
          }
        })
    }
  });
}

export function sendBack (req: express.Request, res: express.Response, next) {
res.json({salary: req['boobs'],taxOwed: req['taxOwed'] })
}
