import * as express from "express";
import * as controller from "./controller";


const router = express.Router();


router.post("/", controller.preTaxIncome, controller.federalAdjustments, controller.FederalDeductions, controller.totalExemptions, controller.federalTaxAmount, controller.federalCredits, controller.additonalFederalAmount, controller.stateDeductions, controller.adjustedIncomeState, controller.stateTaxAmount, controller.californiaSDI, controller.additonalStateAmount, controller.sendBack);




export = router;
