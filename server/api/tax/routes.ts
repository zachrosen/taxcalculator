import * as express from "express";
import * as controller from "./controller";


const router = express.Router();

router.post("/", controller.preTaxIncome, controller.federalAdjustments, controller.federalTaxAmount, controller.stateTaxAmount, controller.FederalDeductions, controller.stateDeductions, controller.adjustedIncomeState, controller.californiaSDI, controller.sendBack);




export = router;
