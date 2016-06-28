namespace app {
  export class TaxCreateTaxController {
    public tax: ITax;
    constructor() {

    }
  }
  angular.module('app').controller('TaxCreateTaxController', TaxCreateTaxController);
}
