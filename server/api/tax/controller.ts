import * as express from "express";

export function multiply5 (req: express.Request, res: express.Response, next) {
  let salary5 = req.body.salary * 5;
  res.json(salary5);
}

export function getAll (req: express.Request, res: express.Response, next) {
  res.json(req.body.salary * 5);

}
