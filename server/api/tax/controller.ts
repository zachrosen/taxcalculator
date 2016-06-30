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

  connection.query('SELECT `'+filingType+'`, `tax_rate` FROM `federal_tax`', function (error, results, fields) {
    if (salary > 0 && salary < results[0][filingType]) {
          req['taxOwed'] = salary * results[0].tax_rate;
          next();
    }
    if (salary > results[0][filingType]) {
      let taxOwedNumber = 0;
      taxOwedNumber += results[0][filingType] * results[0].tax_rate;
        for (let i = 1; i < 7; i++) {
          if (salary > results[i][filingType]) {
                taxOwedNumber += (results[i][filingType] - results[i-1][filingType]) * results[i].tax_rate
          } else {
              taxOwedNumber += (salary - results[i-1][filingType]) * results[i].tax_rate;
              req['taxOwed'] = taxOwedNumber;
              next();
            break;
          }
        }
    }
  });
}

export function sendBack (req: express.Request, res: express.Response, next) {
console.log(req.body.creditTable)
res.json({salary: req['boobs'],taxOwed: req['taxOwed'], credit: req.body.creditTable })
}
