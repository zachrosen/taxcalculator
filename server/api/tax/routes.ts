import * as express from "express";
import * as controller from "./controller";


const router = express.Router();

router.post("/", controller.preTaxIncome, controller.federalTaxAmount, controller.stateTaxAmount, controller.totalExemptions, controller.ftbCostRecoveryFees, controller.nonrefundableRentersCredit, controller.sendBack);




export = router;
