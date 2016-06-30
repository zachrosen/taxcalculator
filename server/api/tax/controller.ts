import * as express from "express";
import * as mysql from "mysql";

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'taxDB'
});


export function preTaxIncome (req: express.Request, res: express.Response, next) {
  req['salary'] = req.body.salary
  next();
}

export function federalTaxAmount (req: express.Request, res: express.Response, next) {
let filingType = req.body.filingType;
let salary = req.body.salary;
let federalTaxOwed = 0;

  connection.query('SELECT `'+filingType+'`, `tax_rate` FROM `federal_tax`', function (error, results, fields) {
    if (salary > 0 && salary < results[0][filingType]) {
          req['federalTaxOwed'] = salary * results[0].tax_rate;
          next();
    }
    if (salary > results[0][filingType]) {
      let federalTaxOwedNumber = 0;
      federalTaxOwedNumber += results[0][filingType] * results[0].tax_rate;
        for (let i = 1; i < 7; i++) {
          if (salary > results[i][filingType]) {
                federalTaxOwedNumber += (results[i][filingType] - results[i-1][filingType]) * results[i].tax_rate
          } else {
              federalTaxOwedNumber += (salary - results[i-1][filingType]) * results[i].tax_rate;
              req['federalTaxOwed'] = federalTaxOwedNumber;
              next();
            break;
          }
        }
    }
  });
}

export function stateTaxAmount (req: express.Request, res: express.Response, next) {
  let filingType = req.body.filingType;
  let state = req.body.state.toLowerCase();
  let salary = req.body.salary;
  let stateTaxOwed = 0;

  connection.query('SELECT `'+filingType+'`, `tax_rate` FROM `'+state+'_tax`', function (error, results, fields) {
    if (salary > 0 && salary < results[0][filingType]){
      req['stateTaxOwed'] = salary * results[0].tax_rate;
      next();
    }
    if (salary > results[0][filingType]) {
      let stateTaxOwedNumber = 0;
      stateTaxOwedNumber += results[0][filingType] * results[0].tax_rate;
        for (let i = 1; i < 9; i++) {
          if (salary > results[i][filingType]) {
                stateTaxOwedNumber += (results[i][filingType] - results[i-1][filingType]) * results[i].tax_rate
          } else {
              stateTaxOwedNumber += (salary - results[i-1][filingType]) * results[i].tax_rate;
              req['stateTaxOwed'] = stateTaxOwedNumber;
              next();
            break;
          }
        }
      }
  });
}

export function sendBack (req: express.Request, res: express.Response, next) {
res.json({salary: req['salary'],federalTaxOwed: req['federalTaxOwed'], stateTaxOwed: req['stateTaxOwed'] })
}
