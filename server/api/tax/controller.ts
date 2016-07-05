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

export function federalAdjustments (req: express.Request, res: express.Response, next) {
  let retirement = req.body.retirement;
  let alimony = req.body.alimony;
  let studentLoanInterest = req.body.studentLoanInterest;
  let totalFederalAdjustments = 0;
    totalFederalAdjustments += retirement + alimony + studentLoanInterest;
    req['totalFederalAdjustments'] = totalFederalAdjustments;
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
        for (let i = 1; i < 6; i++) {
          if (salary > results[i][filingType]) {
                federalTaxOwed += (results[i][filingType] - results[i-1][filingType]) * results[i].tax_rate
          } else {
              federalTaxOwed += (salary - results[i-1][filingType]) * results[i].tax_rate;
              req['federalTaxOwed'] = federalTaxOwed;
              next();
              break;
          }
        }
        if (salary > results[5][filingType]) {
        federalTaxOwed += (salary - results[5][filingType])*results[6].tax_rate;
        req['federalTaxOwed'] = federalTaxOwed;
        next();
}
    }
  });
}

export function federalCredits (req: express.Request, res: express.Response, next) {
let credits = req.body.creditTable;
let totalCredits = 0;
 for (let i = 0; i < credits.length; i++) {
   totalCredits += credits[i]['amount'];
 }
 req['totalFederalCredits'] = totalCredits;
 next();
}

export function additonalFederalAmount (req: express.Request, res: express.Response, next) {
req['additionalFederalAmount'] = req.body.additionalFederalAmount;
next();
}

export function stateDeductions (req: express.Request, res: express.Response, next) {
let stateDeductions = req.body.stateDeductionsTable;
let totalStateDeductions = 0;
let filingType = req.body.filingType
if (stateDeductions.length == 0) {connection.query('SELECT `deduction_amount` FROM `california_standard_deductions`', function (error, results, fields) {
if (filingType == "Single" || filingType == "Married Filing Seperately") {
req['totalStateDeductions'] = results[0].deduction_amount;
next();
}
else if (filingType == "Married Filing Jointly" || filingType == "Head Of HouseHold" || filingType == "Qualifying Widow/Widower") {
req['totalStateDeductions'] = results[1].deduction_amount;
next();
}
else if (req.body.isDependent == true) {
req['totalStateDeductions'] = results[2].deduction_amount;
next();
}
})
}
if(stateDeductions.length > 0) {
 for (let i = 0; i < stateDeductions.length; i++) {
   totalStateDeductions += stateDeductions[i]['amount'];
 }
 connection.query('SELECT `agi_threshold` FROM `california_reduction_in_itemized_deductions`', function (error, results, fields) {
 if((filingType == "Single" || "Married Filing Seperately") && req.body.salary > results[0].agi_threshold) {
   req['extraAmount'] = req.body.salary - results[0].agi_threshold;
 }
 else if((filingType == "Head Of Household") && req.body.salary > results[1].agi_threshold) {
   req['extraAmount'] =req.body.salary - results[1].agi_threshold;
 }
 else if((filingType == "Married Filing Jointly" || "Qualified Widow/Widower") && req.body.salary > results[2].agi_threshold) {
   req['extraAmount'] = req.body.salary - results[2].agi_threshold;
 }

else {req['extraAmount'] = 0;}

if (totalStateDeductions*0.8 < req['extraAmount']*0.06 || req['extraAmount'] === 0) {
   req['totalStateDeductions'] = totalStateDeductions - totalStateDeductions*0.8;
   next();
 }
else {
  req['totalStateDeductions'] = totalStateDeductions - req['extraAmount']*0.06
  next();
 }
 }
 )
}
}


export function adjustedIncomeState(req: express.Request, res: express.Response, next) {
let stateAdjustedIncome = 0;
stateAdjustedIncome = req.body.salary - req['totalStateDeductions'];
req['stateAdjustedIncome'] = stateAdjustedIncome;
next();
}

export function stateTaxAmount (req: express.Request, res: express.Response, next) {
  let filingType = req.body.filingType;
  let state = req.body.state.toLowerCase();
  let stateTaxOwed = 0;

  connection.query('SELECT `'+filingType+'`, `tax_rate` FROM `'+state+'_tax`', function (error, results, fields) {
    if (req['stateAdjustedIncome'] > 0 && req['stateAdjustedIncome'] < results[0][filingType]){
      req['stateTaxOwed'] = req['stateAdjustedIncome'] * results[0].tax_rate;
      next();
    }
    if (req['stateAdjustedIncome'] > results[0][filingType]) {
      stateTaxOwed += results[0][filingType] * results[0].tax_rate;

        for (let i = 1; i < 8; i++) {

          if (req['stateAdjustedIncome'] > results[i][filingType]) {
                stateTaxOwed += (results[i][filingType] - results[i-1][filingType]) * results[i].tax_rate
          } else {
              stateTaxOwed += (req['stateAdjustedIncome'] - results[i-1][filingType]) * results[i].tax_rate;
              req['stateTaxOwed'] = stateTaxOwed;
              next();
            break;
          }
        }
        if (req['stateAdjustedIncome'] > results[7][filingType]) {
        stateTaxOwed += (req['stateAdjustedIncome'] - results[7][filingType]) * results[8].tax_rate
        req['stateTaxOwed'] = stateTaxOwed;
        next();
      }
    }
  });
}

export function FederalDeductions (req: express.Request, res: express.Response, next) {
let federalDeductions = req.body.federalDeductionsTable;
let totalFederalDeductions = 0;
 for (let i = 0; i < federalDeductions.length; i++) {
   totalFederalDeductions += federalDeductions[i]['amount'];
 }
 req['totalFederalDeductions'] = totalFederalDeductions;
 next();
}


export function californiaSDI (req: express.Request, res: express.Response, next) {
  let totalCaliforniaSDI = 0;
  connection.query('SELECT `tax_rate`, `max_wage_that_can_be_taxed` FROM `california_taxable_sdi_ett_sui`', function (error, results, fields) {
    if(req['stateAdjustedIncome'] > results[1].max_wage_that_can_be_taxed) {
      totalCaliforniaSDI += results[1].tax_rate * results[1].max_wage_that_can_be_taxed;
      req['totalCaliforniaSDI'] = totalCaliforniaSDI;
      next();
    } else {
      totalCaliforniaSDI += (req['stateAdjustedIncome'] * 10) * (results[1].tax_rate * 10) / (10 * 10);
      req['totalCaliforniaSDI'] = totalCaliforniaSDI;
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

// export function nonrefundableRentersCredit(req: express.Request, res: express.Response, next) {
//   let filingType = req.body.filingType;
//   let state = req.body.state.toLowerCase();
//
// connection.query('SELECT `filing_status/qualification`, `exemption_amount` FROM `'+state+'_exemption_credits`', function (error, results, fields) {
//   //console.log(results[0]);
// })
// }

export function stateMiscCredits (req: express.Request, res: express.Response, next) {
  connection.query('SELECT `ca_misc_credits`, `misc_tax_rate`, `max_credit`, `max_ca_agi` FROM `california_misc_credits`', function (error, results, fields) {
if(req.body.age >= 65 && req.body.filingType == "Head Of Household" && req["salary"] < results[0].max_ca_agi )
    {
    req["miscHouseholdCredit1"] = results[0].misc_tax_rate * req["salary"];
    console.log(req["miscHouseholdCredit1"]);
}
if (req.body.age >= 65 && req.body.filingType == "Head Of Household" && req["salary"] > results[0].max_ca_agi) {
  req["miscHouseholdCredit1"] = results[0].misc_tax_rate * results[0].max_ca_agi;
}
else {
  req["miscHouseholdCredit1"] = 0;
}
if(req.body.filingType == "Head Of Household" || req.body.isDependent == true) {

  req["miscHouseholdCredit2"] = results[1].max_credit;
  console.log(req["miscHouseholdCredit2"]);
}
else {
  req["miscHouseholdCredit2"] = 0;
}
req["miscStateCredit"] = req["miscHouseholdCredit1"] + req["miscHouseholdCredit2"];
next();
})
}




export function additonalStateAmount (req: express.Request, res: express.Response, next) {
req['additionalStateAmount'] = req.body.additionalStateAmount;
next();
}

export function sendBack (req: express.Request, res: express.Response, next) {


res.json({salary: req['salary'], totalFederalAdjustments: req['totalFederalAdjustments'], exemptionsVal: req['exemptionsVal'], federalTaxOwed: req['federalTaxOwed'], totalExemptions: req['totalExemptions'], ftbCostRecoveryFeesOwed: req['ftbCostRecoveryFeesOwed'], stateTaxOwed: req['stateTaxOwed'], totalFederalDeductions: req['totalFederalDeductions'], totalStateDeductions: req['totalStateDeductions'], stateAdjustedIncome: req['stateAdjustedIncome'], totalCaliforniaSDI: req['totalCaliforniaSDI'], additionalStateAmount: req['additionalStateAmount'], miscStateCredit: req["miscStateCredit"] })

}
