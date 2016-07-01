import * as express from "express";
import * as controller from "./controller";


const router = express.Router();

router.post("/", controller.preTaxIncome, controller.federalTaxAmount, controller.stateTaxAmount, controller.FederalDeductions, controller.stateDeductions, controller.AdjustedIncomeState, controller.sendBack);




export = router;
