import * as express from "express";
import * as controller from "./controller";


const router = express.Router();

router.post("/", controller.preTaxIncome, controller.federalAdjustments, controller.federalTaxAmount, controller.federalCredits, controller.additonalFederalAmount, controller.stateDeductions, controller.adjustedIncomeState, controller.stateTaxAmount, controller.FederalDeductions, controller.californiaSDI, controller.sendBack);




export = router;
