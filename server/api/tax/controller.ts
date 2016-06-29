import * as express from "express";

export function multiply5 (req: express.Request, res: express.Response, next) {
  let details = {salary: req.body.salary * 5,
  filingType: req.body.filingType};
  res.json(details);
}
