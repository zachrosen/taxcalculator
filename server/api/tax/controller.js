"use strict";
var mysql = require("mysql");
var connection = mysql.createConnection({
    host: process.env.HOST_KEY,
    user: process.env.USER_KEY,
    password: process.env.PASSWORD_KEY,
    database: process.env.DATABASE_KEY
});
function preTaxIncome(req, res, next) {
    req['salary'] = req.body.salary;
    next();
}
exports.preTaxIncome = preTaxIncome;
function federalAdjustments(req, res, next) {
    var retirement = req.body.retirement;
    var alimony = req.body.alimony;
    var studentLoanInterest = req.body.studentLoanInterest;
    var totalFederalAdjustments = 0;
    totalFederalAdjustments += retirement + alimony + studentLoanInterest;
    req['totalFederalAdjustments'] = totalFederalAdjustments;
    next();
}
exports.federalAdjustments = federalAdjustments;
function federalTaxAmount(req, res, next) {
    var filingType = req.body.filingType;
    var AGI = req['AGIAfterExemptions'];
    var federalTaxOwed = 0;
    connection.query('SELECT `' + filingType + '`, `tax_rate` FROM `federal_tax`', function (error, results, fields) {
        if (AGI >= 0 && AGI < results[0][filingType]) {
            req['federalTaxOwed'] = AGI * results[0].tax_rate;
            next();
        }
        if (AGI > results[0][filingType]) {
            federalTaxOwed += results[0][filingType] * results[0].tax_rate;
            for (var i = 1; i < 6; i++) {
                if (AGI > results[i][filingType]) {
                    federalTaxOwed += (results[i][filingType] - results[i - 1][filingType]) * results[i].tax_rate;
                }
                else {
                    federalTaxOwed += (AGI - results[i - 1][filingType]) * results[i].tax_rate;
                    req['federalTaxOwed'] = federalTaxOwed;
                    next();
                    break;
                }
            }
            if (AGI > results[5][filingType]) {
                federalTaxOwed += (AGI - results[5][filingType]) * results[6].tax_rate;
                req['federalTaxOwed'] = federalTaxOwed;
                next();
            }
        }
    });
}
exports.federalTaxAmount = federalTaxAmount;
function federalCredits(req, res, next) {
    var credits = req.body.creditTable;
    var totalCredits = 0;
    for (var i = 0; i < credits.length; i++) {
        totalCredits += credits[i]['amount'];
    }
    req['totalFederalCredits'] = totalCredits;
    next();
}
exports.federalCredits = federalCredits;
function additonalFederalAmount(req, res, next) {
    req['additionalFederalAmount'] = req.body.additionalFederalAmount;
    next();
}
exports.additonalFederalAmount = additonalFederalAmount;
function stateDeductions(req, res, next) {
    var stateDeductions = req.body.stateDeductionsTable;
    var totalStateDeductions = 0;
    var filingType = req.body.filingType;
    var AGI = req['AGIAfterExemptions'];
    if (stateDeductions.length == 0) {
        connection.query('SELECT `deduction_amount` FROM `california_standard_deductions`', function (error, results, fields) {
            if (filingType == "Single" || filingType == "Married Filing Separately") {
                req['totalStateDeductions'] = results[0].deduction_amount;
                next();
            }
            else if (filingType == "Married Filing Jointly" || filingType == "Head Of Household" || filingType == "Qualifying Widow/Widower") {
                req['totalStateDeductions'] = results[1].deduction_amount;
                next();
            }
            else if (req.body.isDependent == true) {
                req['totalStateDeductions'] = results[2].deduction_amount;
                next();
            }
        });
    }
    if (stateDeductions.length > 0) {
        for (var i = 0; i < stateDeductions.length; i++) {
            totalStateDeductions += stateDeductions[i]['amount'];
        }
        connection.query('SELECT `agi_threshold` FROM `california_reduction_in_itemized_deductions`', function (error, results, fields) {
            if ((filingType == "Single" || filingType == "Married Filing Separately") && AGI > results[0].agi_threshold) {
                req['extraAmount'] = AGI - results[0].agi_threshold;
            }
            else if ((filingType == "Head Of Household") && AGI > results[1].agi_threshold) {
                req['extraAmount'] = AGI - results[1].agi_threshold;
            }
            else if ((filingType == "Married Filing Jointly" || filingType == "Qualifying Widow/Widower") && AGI > results[2].agi_threshold) {
                req['extraAmount'] = AGI - results[2].agi_threshold;
            }
            else {
                req['extraAmount'] = 0;
            }
            if ((totalStateDeductions * 0.8 < req['extraAmount'] * 0.06) && req['extraAmount'] > 0) {
                req['totalStateDeductions'] = totalStateDeductions - totalStateDeductions * 0.8;
                req["statePhaseoutAmount"] = totalStateDeductions * 0.8;
                next();
            }
            else {
                req['totalStateDeductions'] = totalStateDeductions - req['extraAmount'] * 0.06;
                req["statePhaseoutAmount"] = req['extraAmount'] * 0.06;
                next();
            }
        });
    }
}
exports.stateDeductions = stateDeductions;
function adjustedIncomeState(req, res, next) {
    var stateAdjustedIncome = 0;
    stateAdjustedIncome += req.body.salary - req['totalStateDeductions'];
    if (stateAdjustedIncome <= 0) {
        var newStateAdjustedIncome = 0;
        req['stateAdjustedIncome'] = newStateAdjustedIncome;
        next();
    }
    else {
        req['stateAdjustedIncome'] = stateAdjustedIncome;
        next();
    }
}
exports.adjustedIncomeState = adjustedIncomeState;
function nonrefundableRentersCredit(req, res, next) {
    var filingType = req.body.filingType;
    var state = req.body.state.toLowerCase();
    var isRenter = req.body.isRenter;
    connection.query('SELECT `state_agi`, `' + filingType + '` FROM `' + state + '_nonrefundable_renters_credit`', function (error, results, fields) {
        if (isRenter === true) {
            if (results[1][filingType] == 0) {
                if (req['stateAdjustedIncome'] >= results[0].state_agi) {
                    req['nonrefundableRentersCredit'] = 0;
                }
                else {
                    req['nonrefundableRentersCredit'] = results[0][filingType];
                }
            }
            else {
                if (req['stateAdjustedIncome'] >= results[1].state_agi) {
                    req['nonrefundableRentersCredit'] = 0;
                }
                else {
                    req['nonrefundableRentersCredit'] = results[1][filingType];
                }
            }
        }
        else {
            req['nonrefundableRentersCredit'] = 0;
        }
        next();
    });
}
exports.nonrefundableRentersCredit = nonrefundableRentersCredit;
function stateTaxAmount(req, res, next) {
    var filingType = req.body.filingType;
    var state = req.body.state.toLowerCase();
    var stateTaxOwed = 0;
    connection.query('SELECT `' + filingType + '`, `tax_rate` FROM `' + state + '_tax`', function (error, results, fields) {
        if (req['stateAdjustedIncome'] >= 0 && req['stateAdjustedIncome'] < results[0][filingType]) {
            req['stateTaxOwed'] = req['stateAdjustedIncome'] * results[0].tax_rate;
            next();
        }
        if (req['stateAdjustedIncome'] > results[0][filingType]) {
            stateTaxOwed += results[0][filingType] * results[0].tax_rate;
            for (var i = 1; i < 8; i++) {
                if (req['stateAdjustedIncome'] > results[i][filingType]) {
                    stateTaxOwed += (results[i][filingType] - results[i - 1][filingType]) * results[i].tax_rate;
                }
                else {
                    stateTaxOwed += (req['stateAdjustedIncome'] - results[i - 1][filingType]) * results[i].tax_rate;
                    req['stateTaxOwed'] = stateTaxOwed;
                    next();
                    break;
                }
            }
            if (req['stateAdjustedIncome'] > results[7][filingType]) {
                stateTaxOwed += (req['stateAdjustedIncome'] - results[7][filingType]) * results[8].tax_rate;
                req['stateTaxOwed'] = stateTaxOwed;
                next();
            }
        }
    });
}
exports.stateTaxAmount = stateTaxAmount;
function FederalDeductions(req, res, next) {
    var blind = req.body.isBlind;
    var dependent = req.body.isDependent;
    var age = req.body.age;
    var filingType = req.body.filingType;
    var spouseAge = req.body.spouseAge;
    var spouseBlind = req.body.spouseBlind;
    var federalDeductions = req.body.federalDeductionsTable;
    var boxNumber = 0;
    var salary = req.body.salary;
    var totalFederalDeductions = 0;
    if (federalDeductions.length === 0) {
        connection.query('SELECT * FROM `federal_standard_deductions`, `federal_standard_deductions_65_blind`, `federal_standard_deduction_for_dependants`', function (error, results, fields) {
            if (error)
                return next(error);
            if (blind == null && dependent == null && age < 65) {
                for (var i = 0; i < 330; i++) {
                    if (results[i].filing_status == filingType) {
                        totalFederalDeductions += results[i].standard_deduction_amount;
                        req['totalFederalDeductions'] = totalFederalDeductions;
                        break;
                    }
                }
                next();
            }
            if ((blind == true && dependent == null) || (age >= 65 && dependent == null)) {
                if (blind == true) {
                    boxNumber += 1;
                }
                if (age >= 65) {
                    boxNumber += 1;
                }
                if (spouseBlind == true) {
                    boxNumber += 1;
                }
                if (spouseAge >= 65) {
                    boxNumber += 1;
                }
                for (var i = 0; i < 321; i++) {
                    if (results[i].filing_type == filingType && results[i].number_of_checked_boxes == boxNumber) {
                        totalFederalDeductions += results[i].standard_deduction;
                        req['totalFederalDeductions'] = totalFederalDeductions;
                        break;
                    }
                }
                next();
            }
            if (dependent == true) {
                totalFederalDeductions += salary + results[0].value_of_use;
                if (totalFederalDeductions > results[1].value_of_use && age < 65 && blind == null) {
                    for (var i = 0; i < 5; i++) {
                        if (results[i].filing_status == filingType && totalFederalDeductions > results[i].standard_deduction_amount) {
                            totalFederalDeductions *= 0;
                            totalFederalDeductions += results[i].standard_deduction_amount;
                            req['totalFederalDeductions'] = totalFederalDeductions;
                            break;
                        }
                        if (results[i].filing_status == filingType && totalFederalDeductions < results[i].standard_deduction_amount) {
                            req['totalFederalDeductions'] = totalFederalDeductions;
                            break;
                        }
                    }
                    next();
                }
                if (totalFederalDeductions < results[1].value_of_use && age < 65 && blind == null) {
                    for (var i = 0; i < 5; i++) {
                        if (results[i].filing_status == filingType && results[1].value_of_use < results[i].standard_deduction_amount) {
                            totalFederalDeductions *= 0;
                            totalFederalDeductions += results[1].value_of_use;
                            req['totalFederalDeductions'] = totalFederalDeductions;
                            break;
                        }
                    }
                    next();
                }
                if (totalFederalDeductions > results[1].value_of_use && (age >= 65 || blind == true)) {
                    for (var i = 0; i < 5; i++) {
                        if (results[i].filing_status == filingType && totalFederalDeductions > results[i].standard_deduction_amount) {
                            totalFederalDeductions *= 0;
                            totalFederalDeductions += results[i].standard_deduction_amount;
                            var boxNumber_1 = 0;
                            if (blind == true) {
                                boxNumber_1 += 1;
                            }
                            if (age >= 65) {
                                boxNumber_1 += 1;
                            }
                            if (spouseBlind == true) {
                                boxNumber_1 += 1;
                            }
                            if (spouseAge >= 65) {
                                boxNumber_1 += 1;
                            }
                            if (filingType !== 'Married Filing Jointly' || filingType !== 'Married Filing Separately') {
                                totalFederalDeductions += results[2].value_of_use * boxNumber_1;
                            }
                            if (filingType == 'Married Filing Jointly' || filingType == 'Married Filing Separately') {
                                totalFederalDeductions += results[3].value_of_use * boxNumber_1;
                            }
                            req['totalFederalDeductions'] = totalFederalDeductions;
                            break;
                        }
                        if (results[i].filing_status == filingType && totalFederalDeductions < results[i].standard_deduction_amount) {
                            var boxNumber_2 = 0;
                            if (blind == true) {
                                boxNumber_2 += 1;
                            }
                            if (age >= 65) {
                                boxNumber_2 += 1;
                            }
                            if (spouseBlind == true) {
                                boxNumber_2 += 1;
                            }
                            if (spouseAge >= 65) {
                                boxNumber_2 += 1;
                            }
                            if (filingType !== 'Married Filing Jointly' || filingType !== 'Married Filing Separately') {
                                totalFederalDeductions += results[2].value_of_use * boxNumber_2;
                            }
                            if (filingType == 'Married Filing Jointly' || filingType == 'Married Filing Separately') {
                                totalFederalDeductions += results[3].value_of_use * boxNumber_2;
                            }
                            req['totalFederalDeductions'] = totalFederalDeductions;
                            break;
                        }
                    }
                    next();
                }
                if (totalFederalDeductions < results[1].value_of_use && (age >= 65 || blind == true)) {
                    for (var i = 0; i < 5; i++) {
                        if (results[i].filing_status == filingType && results[1].value_of_use < results[i].standard_deduction_amount) {
                            totalFederalDeductions *= 0;
                            totalFederalDeductions += results[1].value_of_use;
                            var boxNumber_3 = 0;
                            if (blind == true) {
                                boxNumber_3 += 1;
                            }
                            if (age >= 65) {
                                boxNumber_3 += 1;
                            }
                            if (spouseBlind == true) {
                                boxNumber_3 += 1;
                            }
                            if (spouseAge >= 65) {
                                boxNumber_3 += 1;
                            }
                            if (filingType !== 'Married Filing Jointly' || filingType !== 'Married Filing Separately') {
                                totalFederalDeductions += results[2].value_of_use * boxNumber_3;
                            }
                            if (filingType == 'Married Filing Jointly' || filingType == 'Married Filing Separately') {
                                totalFederalDeductions += results[3].value_of_use * boxNumber_3;
                            }
                            req['totalFederalDeductions'] = totalFederalDeductions;
                            break;
                        }
                    }
                    next();
                }
            }
        });
    }
    if (federalDeductions.length > 0) {
        for (var i = 0; i < federalDeductions.length; i++) {
            totalFederalDeductions += federalDeductions[i]['amount'];
        }
        req['totalFederalDeductions'] = totalFederalDeductions;
        next();
    }
}
exports.FederalDeductions = FederalDeductions;
function taxableFICA(req, res, next) {
    var AGI = req['AGIAfterExemptions'];
    var totalSocialSecurity = 0;
    var totalMedicare = 0;
    var totalAdditionalMedicare = 0;
    var totalTaxableFICA = 0;
    var filingType = req.body.filingType;
    connection.query('SELECT `tax_type`, `max_earnings`, `fica_tax_rate` FROM `federal_fica_tax`', function (error, results, fields) {
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
        connection.query('SELECT `filing_status`, `threshold_amount` FROM `federal_fica_additional_medicare_tax`', function (error, resultsFiling, fields) {
            if (filingType == 'Married Filing Jointly' && AGI <= resultsFiling[0].threshold_amount) {
                req['totalAdditionalMedicare'] = 0;
            }
            if (filingType == 'Married Filing Jointly' && AGI > resultsFiling[0].threshold_amount) {
                totalAdditionalMedicare += (AGI - resultsFiling[0].threshold_amount) * results[2].fica_tax_rate;
                req['totalAdditionalMedicare'] = totalAdditionalMedicare;
            }
            if (filingType == 'Married Filing Separately' && AGI <= resultsFiling[1].threshold_amount) {
                req['totalAdditionalMedicare'] = 0;
            }
            if (filingType == 'Married Filing Separately' && AGI > resultsFiling[1].threshold_amount) {
                totalAdditionalMedicare += (AGI - resultsFiling[1].threshold_amount) * results[2].fica_tax_rate;
                req['totalAdditionalMedicare'] = totalAdditionalMedicare;
            }
            if (filingType == 'Single' && AGI <= resultsFiling[2].threshold_amount) {
                req['totalAdditionalMedicare'] = 0;
            }
            if (filingType == 'Single' && AGI > resultsFiling[2].threshold_amount) {
                totalAdditionalMedicare += (AGI - resultsFiling[2].threshold_amount) * results[2].fica_tax_rate;
                req['totalAdditionalMedicare'] = totalAdditionalMedicare;
            }
            if (filingType == 'Head Of Household' && AGI <= resultsFiling[3].threshold_amount) {
                req['totalAdditionalMedicare'] = 0;
            }
            if (filingType == 'Head Of Household' && AGI > resultsFiling[3].threshold_amount) {
                totalAdditionalMedicare += (AGI - resultsFiling[3].threshold_amount) * results[2].fica_tax_rate;
                req['totalAdditionalMedicare'] = totalAdditionalMedicare;
            }
            if (filingType == 'Qualifying Widow/Widower' && AGI <= resultsFiling[4].threshold_amount) {
                req['totalAdditionalMedicare'] = 0;
            }
            if (filingType == 'Qualifying Widow/Widower' && AGI > resultsFiling[4].threshold_amount) {
                totalAdditionalMedicare += (AGI - resultsFiling[4].threshold_amount) * results[2].fica_tax_rate;
                req['totalAdditionalMedicare'] = totalAdditionalMedicare;
            }
            totalTaxableFICA += req['totalSocialSecurity'] + req['totalMedicare'] + req['totalAdditionalMedicare'];
            req['totalTaxableFICA'] = totalTaxableFICA;
            next();
        });
    });
}
exports.taxableFICA = taxableFICA;
function californiaSDI(req, res, next) {
    var totalCaliforniaSDI = 0;
    connection.query('SELECT `tax_rate`, `max_wage_that_can_be_taxed` FROM `california_taxable_sdi_ett_sui`', function (error, results, fields) {
        if (req['stateAdjustedIncome'] > results[1].max_wage_that_can_be_taxed) {
            totalCaliforniaSDI += results[1].tax_rate * results[1].max_wage_that_can_be_taxed;
            req['totalCaliforniaSDI'] = totalCaliforniaSDI;
            next();
        }
        else {
            totalCaliforniaSDI += (req['stateAdjustedIncome'] * 10) * (results[1].tax_rate * 10) / (10 * 10);
            req['totalCaliforniaSDI'] = totalCaliforniaSDI;
            next();
        }
    });
}
exports.californiaSDI = californiaSDI;
function totalExemptions(req, res, next) {
    var filingType = req.body.filingType;
    var exemptionsNum = req.body.numberOfExemptions;
    var AGI = req.body.salary;
    var exemptionsVal = 0;
    connection.query('SELECT `' + filingType + '` FROM `federal_exemptions`', function (error, results, fields) {
        if (AGI <= results[0][filingType]) {
            exemptionsVal = exemptionsNum * results[2][filingType];
        }
        else {
            var exemptionsInitValue = results[2][filingType];
            var exemptionsChangedValue = exemptionsInitValue;
            for (var i = results[0][filingType]; i < AGI; i += results[1][filingType]) {
                exemptionsChangedValue *= 0.98;
                if (exemptionsChangedValue < 0.1) {
                    exemptionsChangedValue = 0;
                    break;
                }
            }
            exemptionsChangedValue *= exemptionsNum;
            exemptionsVal = exemptionsChangedValue;
        }
        req['exemptionsVal'] = exemptionsVal;
        next();
    });
}
exports.totalExemptions = totalExemptions;
function stateMiscCredits(req, res, next) {
    connection.query('SELECT `ca_misc_credits`, `misc_tax_rate`, `max_credit`, `max_ca_agi` FROM `california_misc_credits`', function (error, results, fields) {
        if (req.body.age >= 65 && req.body.filingType == "Head Of Household" && req['stateAdjustedIncome'] < results[0].max_ca_agi) {
            req["miscHouseholdCredit1"] = results[0].misc_tax_rate * req['stateAdjustedIncome'];
        }
        if (req.body.age >= 65 && req.body.filingType == "Head Of Household" && req['stateAdjustedIncome'] > results[0].max_ca_agi) {
            req["miscHouseholdCredit1"] = results[0].misc_tax_rate * results[0].max_ca_agi;
        }
        else {
            req["miscHouseholdCredit1"] = 0;
        }
        if (req.body.filingType == "Head Of Household" || req.body.isDependent == true) {
            req["miscHouseholdCredit2"] = results[1].max_credit;
        }
        else {
            req["miscHouseholdCredit2"] = 0;
        }
        req["miscStateCredit"] = req["miscHouseholdCredit1"] + req["miscHouseholdCredit2"];
        next();
    });
}
exports.stateMiscCredits = stateMiscCredits;
function additonalStateAmount(req, res, next) {
    req['additionalStateAmount'] = req.body.additionalStateAmount;
    next();
}
exports.additonalStateAmount = additonalStateAmount;
function californiaTaxableMentalHealth(req, res, next) {
    var totalCaliforniaTaxableMentalHealth = 0;
    connection.query('SELECT `california_mental_health_services_tax_rate`, `taxable_income_in_access_of` FROM `california_mental_health_services_tax`', function (error, results, fields) {
        if (req['stateAdjustedIncome'] > results[0].taxable_income_in_access_of) {
            totalCaliforniaTaxableMentalHealth += (req['stateAdjustedIncome'] - results[0].taxable_income_in_access_of) * results[0].california_mental_health_services_tax_rate;
            req['totalCaliforniaTaxableMentalHealth'] = totalCaliforniaTaxableMentalHealth;
            next();
        }
        else {
            req['totalCaliforniaTaxableMentalHealth'] = totalCaliforniaTaxableMentalHealth;
            next();
        }
    });
}
exports.californiaTaxableMentalHealth = californiaTaxableMentalHealth;
function stateExemptionCredits(req, res, next) {
    var age = req.body.age;
    var dependent = req.body.isDependent;
    var blind = req.body.isBlind;
    var filingType = req.body.filingType;
    var totalStateExemptionCredits = 0;
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
        for (var i = 0; i < 5; i++) {
            if (results[i].filing_status_qualification == filingType) {
                totalStateExemptionCredits += results[i].exemption_amount;
                break;
            }
        }
        connection.query('SELECT `filing_status`, `reduce_each_credit_by`, `for_each`, `federal_agi_exceeds` FROM `california_phaseout_of_exemption_credits`', function (error, results, fields) {
            for (var i = 0; i < 5; i++) {
                if (results[i].filing_status == filingType) {
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
    });
}
exports.stateExemptionCredits = stateExemptionCredits;
function AGIBefore(req, res, next) {
    req['AGIBeforeExemptions'] = req['salary'] - req['totalFederalDeductions'] - req['totalFederalAdjustments'];
    next();
}
exports.AGIBefore = AGIBefore;
function AGIAfter(req, res, next) {
    var AGIAfterExemptions = 0;
    AGIAfterExemptions += req['AGIBeforeExemptions'] - req['exemptionsVal'];
    if (AGIAfterExemptions <= 0) {
        var newAGIAfterExemptions = 0;
        req['AGIAfterExemptions'] = newAGIAfterExemptions;
        next();
    }
    else {
        req['AGIAfterExemptions'] = req['AGIBeforeExemptions'] - req['exemptionsVal'];
        next();
    }
}
exports.AGIAfter = AGIAfter;
function totalFederal(req, res, next) {
    var totalFederal = 0;
    totalFederal += req['federalTaxOwed'] + req['totalTaxableFICA'] - req['totalFederalCredits'];
    if (totalFederal < 0) {
        totalFederal *= 0;
        totalFederal += req['additionalFederalAmount'];
    }
    else {
        totalFederal += req['additionalFederalAmount'];
    }
    if (totalFederal <= 0) {
        totalFederal = 0;
    }
    req['totalFederal'] = totalFederal;
    next();
}
exports.totalFederal = totalFederal;
function totalState(req, res, next) {
    var totalState = 0;
    totalState += req['stateTaxOwed'] + req['totalCaliforniaSDI'] + req['totalCaliforniaTaxableMentalHealth'] - req['totalStateExemptionCredits'] - req['nonrefundableRentersCredit'] - req["miscStateCredit"];
    if (totalState < 0) {
        totalState *= 0;
        totalState += req['additionalStateAmount'];
    }
    else {
        totalState += req['additionalStateAmount'];
    }
    if (totalState <= 0) {
        totalState = 0;
    }
    req['totalState'] = totalState;
    next();
}
exports.totalState = totalState;
function totalTaxes(req, res, next) {
    var totalTaxes = 0;
    totalTaxes += req['totalFederal'] + req['totalState'];
    req['totalTaxes'] = totalTaxes;
    next();
}
exports.totalTaxes = totalTaxes;
function incomeAfterTaxes(req, res, next) {
    var incomeAfterTaxes = 0;
    incomeAfterTaxes += req['salary'] - req['totalTaxes'];
    req['incomeAfterTaxes'] = incomeAfterTaxes;
    next();
}
exports.incomeAfterTaxes = incomeAfterTaxes;
function sendBack(req, res, next) {
    res.json({
        salary: req['salary'], totalFederalAdjustments: req['totalFederalAdjustments'], exemptionsVal: req['exemptionsVal'], federalTaxOwed: req['federalTaxOwed'], totalExemptions: req['totalExemptions'], AGI: req['AGIAfterExemptions'], ftbCostRecoveryFeesOwed: req['ftbCostRecoveryFeesOwed'], stateTaxOwed: req['stateTaxOwed'], totalFederalDeductions: req['totalFederalDeductions'], totalFederalCredits: req['totalFederalCredits'], additionalFederalAmount: req['additionalFederalAmount'], totalStateDeductions: req['totalStateDeductions'], stateAdjustedIncome: req['stateAdjustedIncome'],
        totalCaliforniaSDI: req['totalCaliforniaSDI'],
        nonrefundableRentersCredit: req['nonrefundableRentersCredit'], additionalStateAmount: req['additionalStateAmount'],
        totalCaliforniaTaxableMentalHealth: req['totalCaliforniaTaxableMentalHealth'], blind: req.body.isBlind, dependent: req.body.isDependent, age: req.body.age, totalStateExemptionCredits: req['totalStateExemptionCredits'], totalSocialSecurity: req['totalSocialSecurity'], totalMedicare: req['totalMedicare'], totalAdditionalMedicare: req['totalAdditionalMedicare'], totalTaxableFICA: req['totalTaxableFICA'], miscStateCredit: req["miscStateCredit"], totalFederal: req['totalFederal'], totalState: req['totalState'], totalTaxes: req['totalTaxes'], incomeAfterTaxes: req['incomeAfterTaxes']
    });
}
exports.sendBack = sendBack;
