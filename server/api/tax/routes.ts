import * as express from "express";
import * as controller from "./controller";


const router = express.Router();



router.post("/", controller.preTaxIncome, controller.federalAdjustments, controller.FederalDeductions, controller.AGIBefore, controller.totalExemptions, controller.AGIAfter, controller.federalTaxAmount, controller.federalCredits, controller.additonalFederalAmount, controller.stateDeductions, controller.adjustedIncomeState, controller.nonrefundableRentersCredit, controller.stateTaxAmount, controller.californiaSDI, controller.additonalStateAmount, controller.californiaTaxableMentalHealth, controller.stateExemptionCredits, controller.sendBack);




export = router;
