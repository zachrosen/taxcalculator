import * as express from "express";
import * as controller from "./controller";


const router = express.Router();

router.post("/", controller.multiply5);
router.get("/", controller.getAll);

export = router;
