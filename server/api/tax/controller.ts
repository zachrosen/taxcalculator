import * as express from "express";
import * as mysql from "mysql";

var connection = mysql.createConnection({
  //properties
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'taxDB'
});

export function multiply5 (req: express.Request, res: express.Response, next) {
  connection.query('SELECT `single_filers` FROM `federal_tax`', function (error, results, fields) {

    if(req.body.salary < results[0].single_filers) {
      let details = {salary: req.body.salary * 0.1,
      filingType: req.body.filingType};
      res.json(details);
    } else if (results[0].single_filers < req.body.salary < results[1].single_filers) {
      let details = {salary: req.body.salary * 0.15,
      filingType: req.body.filingType};
      res.json(details);
    } else if (results[1].single_filers < req.body.salary < results[2].single_filers) {
      let details = {salary: req.body.salary * 0.25,
      filingType: req.body.filingType};
      res.json(details);
    } else if (results[2].single_filers < req.body.salary < results[3].single_filers) {
      let details = {salary: req.body.salary * 0.28,
      filingType: req.body.filingType};
      res.json(details);
    } else if (results[3].single_filers < req.body.salary < results[4].single_filers) {
      let details = {salary: req.body.salary * 0.33,
      filingType: req.body.filingType};
      res.json(details);
    } else if (results[4].single_filers < req.body.salary < results[5].single_filers) {
      let details = {salary: req.body.salary * 0.35,
      filingType: req.body.filingType};
      res.json(details);
    } else if (req.body.salary > results[6].single_filers) {
      let details = {salary: req.body.salary * 0.396,
      filingType: req.body.filingType};
      res.json(details);
    }

  });
}
