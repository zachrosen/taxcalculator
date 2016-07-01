import * as express from "express";
import * as controller from "./controller";


const router = express.Router();


router.post("/", controller.preTaxIncome, controller.federalAdjustments, controller.federalTaxAmount, controller.federalCredits, controller.additonalFederalAmount, controller.stateTaxAmount, controller.FederalDeductions, controller.stateDeductions, controller.adjustedIncomeState, controller.californiaSDI, controller.totalExemptions, controller.ftbCostRecoveryFees, controller.sendBack);





export = router;
