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
    type: null,
    amount: null,
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

    public htmlPopover1 = this.$sce.trustAsHtml("Filing Status: <a href='https://en.wikipedia.org/wiki/Filing_status' target='_blank'>Definition</a>")

    public htmlPopover1point5 = this.$sce.trustAsHtml("Dependant: <a href='https://www.irs.gov/publications/p17/ch03.html#en_US_2015_publink1000170857' target='_blank'>Definition</a><br>Qualified Renter: <a href='https://www.ftb.ca.gov/individuals/faq/ivr/203.shtml' target='_blank'>Definition</a>")

    public htmlPopover2 = this.$sce.trustAsHtml("Federal Adjustments: <a href='https://www.irs.gov/publications/p17/pt04.html' target='_blank'>Definition</a>")

    public htmlPopover3 = this.$sce.trustAsHtml("Federal Deductions: <a href='https://www.irs.gov/uac/deductions' target='_blank'>Definition</a>")

    public htmlPopover4 = this.$sce.trustAsHtml("Federal Personal Exemptions: <a href='https://www.irs.com/articles/personal-and-dependent-exemptions' target='_blank'>Definition</a>")

    public htmlPopover5 = this.$sce.trustAsHtml("Federal Credits: <a href='https://www.irs.gov/credits-deductions/individuals' target='_blank'>Definition</a>")

    public htmlPopover6 = this.$sce.trustAsHtml("This is the additional amount that is paid, to the federal government, as a buffer in case taxes are estimated or calculated incorrectly.")

    public htmlPopover7 = this.$sce.trustAsHtml("California State Deductions: <a href='https://www.ftb.ca.gov/forms/2015_California_Tax_Rates_and_Exemptions.shtml#sd' target='_blank'>Definition</a>")

    public htmlPopover8 = this.$sce.trustAsHtml("This is the additional amount that is paid, to the state, as a buffer in case taxes are estimated or calculated incorrectly.")

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
