namespace app {
  export class TaxCreateTaxController {
    public tax:ITax = {_id: null,
    salary: null,
    age: null,
    isBlind: null,
    isDependent: null,
    isRenter: null,
    filingType: null,
    retirement: null,
    alimony: null,
    studentLoanInterest: null,
    federalDeductionsTable: [],
    numberOfExemptions: null,
    creditTable: [],
    aditionalFederalAmount: null,
    state: null,
    stateDeductionsTable: []}
    public federalDeductionsTable= [];
    public creditTable= [];
    public stateDeductionsTable= [];

    public move() {
  var elem = document.getElementById("myBar");
  var width = 0;
  var id = setInterval(frame, 10);
  function frame() {
    if (width >= 100) {
      clearInterval(id);
    } else {
      width = width++;
      elem.style.width = width + '%';
      document.getElementById("demo").innerHTML = width * 1  + '%';
    }
  }
}

    public addFederalDeduction() {
      this.tax.federalDeductionsTable.push({
        type: '',
        amount: parseInt('')
      });
    }

    public removeFederalDeduction(d) {
      this.federalDeductionsTable.splice(this.federalDeductionsTable.indexOf(d), 1);
    }

    public addCredit() {
      this.tax.creditTable.push({
        type: '',
        amount: parseInt('')
      });
    }

    public removeCredit(c) {
      this.creditTable.splice(this.creditTable.indexOf(c), 1);
    }

    public addStateDeduction() {
      this.tax.stateDeductionsTable.push({
        type: '',
        amount: parseInt('')
      })
    }

    public removeStateDeduction(s) {
      this.stateDeductionsTable.splice(this.stateDeductionsTable.indexOf(s), 1);
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
  this.tax.creditTable = [];
  this.tax.federalDeductionsTable = [];
  this.tax.stateDeductionsTable = [];
    }
  }
  angular.module('app').controller('TaxCreateTaxController', TaxCreateTaxController);
}
