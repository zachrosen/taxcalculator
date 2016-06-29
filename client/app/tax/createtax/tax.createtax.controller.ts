namespace app {
  export class TaxCreateTaxController {
    public tax: ITax;
    public federalDeductionsTable= [];
    public creditTable= [];
    public stateDeductionsTable= [];

    public addFederalDeduction() {
      this.federalDeductionsTable.push({
        federalDeductionDescription: '',
        federalDeductionAmt: parseInt('')
      });
    }

    public addCredit() {
      this.creditTable.push({
        creditDescription: '',
        creditAmt: parseInt('')
      });
    }

    public addStateDeduction() {
      this.stateDeductionsTable.push({
        stateDeductionDescription: '',
        stateDeductionAmt: parseInt('')
      })
    }

    public createTax() {
      this.TaxService.createTax(this.tax).then((res) => {
      this.TaxService.data = res;
      console.log(res);

      this.$state.go('result');

    }, (err) => {
      alert(err);
    })
  };

    constructor(
      private TaxService: app.TaxService,
      private $state: ng.ui.IStateService
    ) {

    }
  }
  angular.module('app').controller('TaxCreateTaxController', TaxCreateTaxController);
}
