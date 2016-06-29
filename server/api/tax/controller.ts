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

    let details = {salary: req.body.salary * results[0].single_filers,
    filingType: req.body.filingType};
    res.json(details);

  });
}
