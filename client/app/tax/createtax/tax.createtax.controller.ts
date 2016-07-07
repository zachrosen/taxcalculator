namespace app {
  export class TaxCreateTaxController {
    public tax:ITax = {_id: null,
    salary: null,
    age: null,
    isBlind: null,
    isDependent: null,
    isRenter: null,
    filingType: 'Single',
    retirement: null,
    alimony: null,
    studentLoanInterest: null,
    federalDeductionsTable: [{}],
    numberOfExemptions: null,
    creditTable: [{}],
    aditionalFederalAmount: null,
    state: 'California',
    stateDeductionsTable: [{}],
    additionalStateAmount: null}

    public federalDeductionsTable= [];
    public creditTable= [];
    public stateDeductionsTable= [];


    public addFederalDeduction() {
      this.tax.federalDeductionsTable.push({
        type: '',
        amount: parseInt('')
      });
    }

    public removeFederalDeduction(d) {
      this.tax.federalDeductionsTable.splice(this.tax.federalDeductionsTable.indexOf(d), 1);
    }

    public addCredit() {
      this.tax.creditTable.push({
        type: '',
        amount: parseInt('')
      });
    }

    public removeCredit(c) {
      this.tax.creditTable.splice(this.tax.creditTable.indexOf(c), 1);
    }

    public addStateDeduction() {
      this.tax.stateDeductionsTable.push({
        type: '',
        amount: parseInt('')
      })
    }

    public removeStateDeduction(s) {
      this.tax.stateDeductionsTable.splice(this.tax.stateDeductionsTable.indexOf(s), 1);
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
