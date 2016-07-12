namespace app {
  export class TaxCreateTaxController {
    public tax:ITax = {_id: null,
    salary: null,
    age: null,
    spouseAge: null,
    isBlind: null,
    isDependent: null,
    isRenter: null,
    spouseBlind: null,
    filingType: null,
    retirement: null,
    alimony: null,
    studentLoanInterest: null,
    federalDeductionsTable: [],
    numberOfExemptions: null,
    creditTable: [],
    additionalFederalAmount: null,
    state: null,
    stateDeductionsTable: [],
    additionalStateAmount: null}

    public federalDeductionsTable= [];
    public creditTable= [];
    public stateDeductionsTable= [];
    public fedDeductions;
    public stateDeductions;



    public placement = {
      options: [
        'top',
        'top-left',
        'top-right',
        'bottom',
        'bottom-left',
        'bottom-right',
        'left',
        'left-top',
        'left-bottom',
        'right',
        'right-top',
        'right-bottom'
      ],
      selected: 'top'
    };

    public htmlPopover = this.$sce.trustAsHtml("Hello <a href='http://www.facebook.com'>XYZ</a>")

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
      if (this.fedDeductions === "standardFederal") {
        this.tax.federalDeductionsTable = [];
      }
      if (this.fedDeductions === "standardState") {
        this.tax.stateDeductionsTable = [];
      }
      this.TaxService.createTax(this.tax).then((res) => {
      this.TaxService.data = res;
      this.$state.go('result');
    }, (err) => {
      alert(err);
    })
  };
    constructor(
      private TaxService: app.TaxService,
      private $state: ng.ui.IStateService,
      private $sce
    ) {
  this.tax.creditTable = [];
  this.tax.federalDeductionsTable = [];
  this.tax.stateDeductionsTable = [];
    }
  }
  angular.module('app').controller('TaxCreateTaxController', TaxCreateTaxController);
}
