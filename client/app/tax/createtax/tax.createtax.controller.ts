namespace app {
  export class TaxCreateTaxController {
    public tax: ITax;
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
      this.federalDeductionsTable.push({
        federalDeductionDescription: '',
        federalDeductionAmt: parseInt('')
      });
    }

    public removeFederalDeduction(d) {
      this.federalDeductionsTable.splice(this.federalDeductionsTable.indexOf(d), 1);
    }

    public addCredit() {
      this.creditTable.push({
        creditDescription: '',
        creditAmt: parseInt('')
      });
    }

    public removeCredit(c) {
      this.creditTable.splice(this.creditTable.indexOf(c), 1);
    }

    public addStateDeduction() {
      this.stateDeductionsTable.push({
        stateDeductionDescription: '',
        stateDeductionAmt: parseInt('')
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

    }
  }
  angular.module('app').controller('TaxCreateTaxController', TaxCreateTaxController);
}
