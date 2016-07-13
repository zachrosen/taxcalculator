"use strict";
var express = require("express");
var controller = require("./controller");
var router = express.Router();
router.post("/", controller.preTaxIncome, controller.federalAdjustments, controller.FederalDeductions, controller.AGIBefore, controller.totalExemptions, controller.AGIAfter, controller.federalTaxAmount, controller.federalCredits, controller.additonalFederalAmount, controller.taxableFICA, controller.stateDeductions, controller.adjustedIncomeState, controller.nonrefundableRentersCredit, controller.stateTaxAmount, controller.californiaSDI, controller.additonalStateAmount, controller.californiaTaxableMentalHealth, controller.stateExemptionCredits, controller.stateMiscCredits, controller.totalFederal, controller.totalState, controller.totalTaxes, controller.incomeAfterTaxes, controller.sendBack);
module.exports = router;
