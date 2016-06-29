import * as express from "express";
import * as controller from "./controller";


const router = express.Router();

router.post("/", controller.multiply5);


export = router;
