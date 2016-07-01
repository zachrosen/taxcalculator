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
      federalTaxOwed += results[0][filingType] * results[0].tax_rate;
        for (let i = 1; i < 5; i++) {
          if (salary > results[i][filingType]) {
                federalTaxOwed += (results[i][filingType] - results[i-1][filingType]) * results[i].tax_rate
          } else {
              federalTaxOwed += (salary - results[i-1][filingType]) * results[i].tax_rate;
              req['federalTaxOwed'] = federalTaxOwed;
              next();
            break;
          }
        }
        federalTaxOwed += (salary - results[5][filingType])*results[6].tax_rate;
        req['federalTaxOwed'] = federalTaxOwed;
        next();

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

        for (let i = 1; i < 6; i++) {

          if (salary > results[i][filingType]) {
                stateTaxOwedNumber += (results[i][filingType] - results[i-1][filingType]) * results[i].tax_rate
          } else {
              stateTaxOwedNumber += (salary - results[i-1][filingType]) * results[i].tax_rate;
              req['stateTaxOwed'] = stateTaxOwedNumber;
              next();
            break;
          }
        }

        stateTaxOwedNumber += (salary - results[6][filingType]) * results[7].tax_rate
        req['stateTaxOwed'] = stateTaxOwedNumber;
        next();

      }
  });
}

export function totalExemptions(req: express.Request, res: express.Response, next){
  let filingType = req.body.filingType;
  let exemptionsNum = req.body.numberOfExemptions;
  let AGI = req.body.salary;
  let exemptionsVal = 0;

  connection.query('SELECT `'+filingType+'` FROM `federal_exemptions`', function (error, results, fields) {
    if(AGI <= results[0][filingType]) {
      exemptionsVal = exemptionsNum * results[2][filingType];
    } else {
      let exemptionsInitValue = results[2][filingType];
      let exemptionsChangedValue = exemptionsInitValue;

      for(let i = results[0][filingType]; i < AGI; i += results[1][filingType]) {
        exemptionsChangedValue *= 0.98;
        if(exemptionsChangedValue < 0.1) {
          exemptionsChangedValue = 0;
          break;
        }
      }
      exemptionsChangedValue *= exemptionsNum;
      exemptionsVal = exemptionsChangedValue.toFixed(2);
      console.log(exemptionsVal);
    }
    req['exemptionsVal'] = exemptionsVal;
    next();
  })
  }




export function ftbCostRecoveryFees(req: express.Request, res: express.Response, next) {
  let state = req.body.state.toLowerCase();
  let ftbCostRecoveryFeesOwed = 0;

connection.query('SELECT sum(`fee`) AS `fee` FROM `'+state+'_ftb_cost_recovery_fees`', function(error, results, fields) {
  req['ftbCostRecoveryFeesOwed'] = results[0].fee;
  next();
})
}

export function nonrefundableRentersCredit(req: express.Request, res: express.Response, next) {
  let filingType = req.body.filingType;
  let state = req.body.state.toLowerCase();

connection.query('SELECT `filing_status/qualification`, `exemption_amount` FROM `'+state+'_exemption_credits`', function (error, results, fields) {
  //console.log(results[0]);
})
}

export function sendBack (req: express.Request, res: express.Response, next) {

res.json({salary: req['salary'], exemptionsVal: req['exemptionsVal'], federalTaxOwed: req['federalTaxOwed'], stateTaxOwed: req['stateTaxOwed'], totalExemptions: req['totalExemptions'], ftbCostRecoveryFeesOwed: req['ftbCostRecoveryFeesOwed']})

}
