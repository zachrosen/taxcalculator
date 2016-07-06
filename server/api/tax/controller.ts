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
let AGI = req['AGIAfterExemptions'];
let federalTaxOwed = 0;

  connection.query('SELECT `'+filingType+'`, `tax_rate` FROM `federal_tax`', function (error, results, fields) {
    if (AGI > 0 && AGI < results[0][filingType]) {
          req['federalTaxOwed'] = AGI * results[0].tax_rate;
          next();
    }
    if (AGI > results[0][filingType]) {
      federalTaxOwed += results[0][filingType] * results[0].tax_rate;
        for (let i = 1; i < 6; i++) {

          if (AGI > results[i][filingType]) {

                federalTaxOwed += (results[i][filingType] - results[i-1][filingType]) * results[i].tax_rate
          } else {
              federalTaxOwed += (AGI - results[i-1][filingType]) * results[i].tax_rate;
              req['federalTaxOwed'] = federalTaxOwed;
              next();
              break;
          }
        }
        if (AGI > results[5][filingType]) {
        federalTaxOwed += (AGI - results[5][filingType])*results[6].tax_rate;
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
  if(req.body.additionalFederalAmount == null) {
    req['additionalFederalAmount'] = 0;
    next();
  }
req['additionalFederalAmount'] = req.body.additionalFederalAmount;
next();
}

export function stateDeductions (req: express.Request, res: express.Response, next) {
let stateDeductions = req.body.stateDeductionsTable;
let totalStateDeductions = 0;
let filingType = req.body.filingType;
let AGI = req['AGIAfterExemptions'];
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
   req['extraAmount'] = AGI - results[0].agi_threshold;
 }
 else if((filingType == "Head Of Household") && req.body.salary > results[1].agi_threshold) {
   req['extraAmount'] =AGI - results[1].agi_threshold;
 }
 else if((filingType == "Married Filing Jointly" || "Qualified Widow/Widower") && req.body.salary > results[2].agi_threshold) {
   req['extraAmount'] = AGI - results[2].agi_threshold;
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

export function nonrefundableRentersCredit(req: express.Request, res: express.Response, next) {
    let filingType = req.body.filingType;
    let state = req.body.state.toLowerCase();
    let isRenter = req.body.isRenter;

    connection.query('SELECT `state_agi`, `' + filingType + '` FROM `' + state + '_nonrefundable_renters_credit`', function(error, results, fields) {
        if (isRenter === true) {
            if (results[1][filingType] == 0) {
                if (req['stateAdjustedIncome'] >= results[0].state_agi) {
                    req['nonrefundableRentersCredit'] = 0;
                } else {
                    req['nonrefundableRentersCredit'] = results[0][filingType];
                }

            } else {
                if (req['stateAdjustedIncome'] >= results[1].state_agi) {
                    req['nonrefundableRentersCredit'] = 0;
                } else {
                    req['nonrefundableRentersCredit'] = results[1][filingType];
                }
            }
        } else {
            req['nonrefundableRentersCredit'] = 0;
        }
        next();
    })
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
if(federalDeductions.length = 0) {

connection.query('SELECT `tax_rate` FROM `tax`', function (error, results, fields) {

})

}
if(federalDeductions.length > 0) {
 for (let i = 0; i < federalDeductions.length; i++) {
   totalFederalDeductions += federalDeductions[i]['amount'];
 }
 req['totalFederalDeductions'] = totalFederalDeductions;
 next();
 }
}

export function taxableFICA (req: express.Request, res: express.Response, next) {
  let AGI = req['AGIAfterExemptions'];
  let totalSocialSecurity = 0;
  let totalMedicare = 0;
  let totalAdditionalMedicare = 0;
  let totalTaxableFICA = 0;
  connection.query('SELECT `tax_type`, `max_earnings`, `fica_tax_rate` FROM `federal_fica_tax`', function (error, results, fields) {
  // for loop
    if (AGI <= results[0].max_earnings) {
      totalSocialSecurity += AGI * results[0].fica_tax_rate;
      req['totalSocialSecurity'] = totalSocialSecurity;
    }
    if (AGI > results[0].max_earnings) {
      totalSocialSecurity += results[0].max_earnings * results[0].fica_tax_rate;
      req['totalSocialSecurity'] = totalSocialSecurity;
    }
    if (AGI <= results[1].max_earnings) {
      totalMedicare += AGI * results[1].fica_tax_rate;
      req['totalMedicare'] = totalMedicare;
    }
    if (AGI > results[1].max_earnings) {
      totalMedicare += results[1].max_earnings * results[1].fica_tax_rate;
      req['totalMedicare'] = totalMedicare;
    }
    if (AGI <= results[2].max_earnings) {
      req['totalAdditionalMedicare'] = 0;
    }
    if (AGI > results[2].max_earnings) {
      totalAdditionalMedicare += (AGI - results[2].max_earnings) * results[2].fica_tax_rate;
      req['totalAdditionalMedicare'] = totalAdditionalMedicare;
    }
    totalTaxableFICA += req['totalSocialSecurity'] + req['totalMedicare'] + req['totalAdditionalMedicare'];
    req['totalTaxableFICA'] = totalTaxableFICA;
    next();
  });
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




export function stateMiscCredits (req: express.Request, res: express.Response, next) {
  connection.query('SELECT `ca_misc_credits`, `misc_tax_rate`, `max_credit`, `max_ca_agi` FROM `california_misc_credits`', function (error, results, fields) {
if(req.body.age >= 65 && req.body.filingType == "Head Of Household" && req['stateAdjustedIncome'] < results[0].max_ca_agi )
    {
    req["miscHouseholdCredit1"] = results[0].misc_tax_rate * req['stateAdjustedIncome'];
}
if (req.body.age >= 65 && req.body.filingType == "Head Of Household" && req['stateAdjustedIncome'] > results[0].max_ca_agi) {
  req["miscHouseholdCredit1"] = results[0].misc_tax_rate * results[0].max_ca_agi;
}
else {
  req["miscHouseholdCredit1"] = 0;
}
if(req.body.filingType == "Head Of Household" || req.body.isDependent == true) {

  req["miscHouseholdCredit2"] = results[1].max_credit;
}
else {
  req["miscHouseholdCredit2"] = 0;
}
req["miscStateCredit"] = req["miscHouseholdCredit1"] + req["miscHouseholdCredit2"];
next();
})
}




export function additonalStateAmount (req: express.Request, res: express.Response, next) {
  if(req.body.additionalStateAmount == null) {
    req['additionalStateAmount'] = 0;
    next();
  }
req['additionalStateAmount'] = req.body.additionalStateAmount;
next();
}

export function californiaTaxableMentalHealth (req: express.Request, res: express.Response, next) {
  let totalCaliforniaTaxableMentalHealth = 0;
  connection.query('SELECT `california_mental_health_services_tax_rate`, `taxable_income_in_access_of` FROM `california_mental_health_services_tax`', function (error, results, fields) {
    if(req['stateAdjustedIncome'] > results[0].taxable_income_in_access_of) {
      totalCaliforniaTaxableMentalHealth += (req['stateAdjustedIncome'] - results[0].taxable_income_in_access_of) * results[0].california_mental_health_services_tax_rate;
      req['totalCaliforniaTaxableMentalHealth'] = totalCaliforniaTaxableMentalHealth;
      next();
    } else {
      req['totalCaliforniaTaxableMentalHealth'] = totalCaliforniaTaxableMentalHealth;
      next();
    }
  });
}

export function stateExemptionCredits (req: express.Request, res: express.Response, next) {
  let age = req.body.age;
  let dependent = req.body.isDependent;
  let blind = req.body.isBlind;
  let filingType = req.body.filingType;
  let totalStateExemptionCredits = 0;
  connection.query('SELECT `filing_status_qualification`, `exemption_amount` FROM `california_exemption_credits`', function (error, results, fields) {
    if (dependent == true) {
      totalStateExemptionCredits += results[5].exemption_amount;
    }
    if (blind == true) {
      totalStateExemptionCredits += results[6].exemption_amount;
    }
    if (age >= results[7].filing_status_qualification) {
      totalStateExemptionCredits += results[7].exemption_amount;
    }
    for (let i = 0; i < 5; i++) {
      if(results[i].filing_status_qualification == filingType) {
        totalStateExemptionCredits += results[i].exemption_amount;
        break;
      }
    }
    connection.query('SELECT `filing_status`, `reduce_each_credit_by`, `for_each`, `federal_agi_exceeds` FROM `california_phaseout_of_exemption_credits`', function (error, results, fields) {
      for (let i = 0; i < 5; i++) {
        if(results[i].filing_status == filingType) {
          totalStateExemptionCredits -= Math.floor((req['AGIAfterExemptions'] - results[i].federal_agi_exceeds) / results[i].for_each) * results[i].reduce_each_credit_by;
          break;
        }
      }
      if (totalStateExemptionCredits <= 0) {
        totalStateExemptionCredits = 0;
      }
      req['totalStateExemptionCredits'] = totalStateExemptionCredits;
      next();
    });


})
}

export function AGIBefore (req: express.Request, res: express.Response, next) {
  req['AGIBeforeExemptions'] = req['salary'] - req['totalFederalDeductions'] - req['totalFederalAdjustments'];
  next();
}

export function AGIAfter (req: express.Request, res: express.Response, next) {
    req['AGIAfterExemptions'] = req['AGIBeforeExemptions'] - req['exemptionsVal'];
    next();
  }

export function totalFederal (req: express.Request, res: express.Response, next) {
  let totalFederal = 0;
  totalFederal += req['federalTaxOwed'] + req['totalTaxableFICA'] - req['totalFederalCredits'] + req['additionalFederalAmount'];
  if(totalFederal <= 0) {
    totalFederal = 0;
  }
  req['totalFederal'] = totalFederal;
  next();
}

export function totalState (req: express.Request, res: express.Response, next) {
  let totalState = 0;
  totalState += req['stateTaxOwed'] + req['totalCaliforniaSDI'] + req['totalCaliforniaTaxableMentalHealth'] - req['totalStateExemptionCredits'] - req['nonrefundableRentersCredit'] - req["miscStateCredit"] + req['additionalStateAmount'];
  if(totalState <= 0) {
    totalState = 0;
  }
  req['totalState'] = totalState;
  next();
}

export function totalTaxes (req: express.Request, res: express.Response, next) {
  let totalTaxes = 0;
  totalTaxes += req['totalFederal'] + req['totalState'];
  req['totalTaxes'] = totalTaxes;
  next();
}

export function incomeAfterTaxes (req: express.Request, res: express.Response, next) {
  let incomeAfterTaxes = 0;
  incomeAfterTaxes += req['salary'] - req['totalTaxes'];
  req['incomeAfterTaxes'] = incomeAfterTaxes;
  next();
}

  export function sendBack (req: express.Request, res: express.Response, next) {
  res.json({salary: req['salary'], totalFederalAdjustments: req['totalFederalAdjustments'], exemptionsVal: req['exemptionsVal'], federalTaxOwed: req['federalTaxOwed'], totalExemptions: req['totalExemptions'], AGI: req['AGIAfterExemptions'], ftbCostRecoveryFeesOwed: req['ftbCostRecoveryFeesOwed'], stateTaxOwed: req['stateTaxOwed'], totalFederalDeductions: req['totalFederalDeductions'], totalFederalCredits:  req['totalFederalCredits'], additionalFederalAmount: req['additionalFederalAmount'],totalStateDeductions: req['totalStateDeductions'], stateAdjustedIncome: req['stateAdjustedIncome'],
  totalCaliforniaSDI: req['totalCaliforniaSDI'],
  nonrefundableRentersCredit: req['nonrefundableRentersCredit'], additionalStateAmount: req['additionalStateAmount'],
  totalCaliforniaTaxableMentalHealth: req['totalCaliforniaTaxableMentalHealth'], blind: req.body.isBlind, dependent: req.body.isDependent, age: req.body.age, totalStateExemptionCredits: req['totalStateExemptionCredits'], totalSocialSecurity: req['totalSocialSecurity'], totalMedicare: req['totalMedicare'], totalAdditionalMedicare: req['totalAdditionalMedicare'], totalTaxableFICA: req['totalTaxableFICA'], miscStateCredit: req["miscStateCredit"], totalFederal: req['totalFederal'], totalState: req['totalState'], totalTaxes: req['totalTaxes'], incomeAfterTaxes: req['incomeAfterTaxes'] })
  }
