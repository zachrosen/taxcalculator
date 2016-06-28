import * as path from "path";

export = {
/**
 * absolute path for the main project folder
 **/

 root: path.normalize(__dirname + "/../../"),

 /**
  * absolute path for the client folder
  **/

 client: path.normalize(__dirname + "/../../client"),

 /**
  * absolute path for the server folder
  **/

 server: path.normalize(__dirname + "/../")

}
