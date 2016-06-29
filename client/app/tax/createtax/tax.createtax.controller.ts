namespace app {
  export class TaxCreateTaxController {
    public tax: ITax;
    public createTax() {
      this.TaxService.createTax(this.tax).then((res) => {
      this.TaxService.data = res;
      console.log(res);

      this.$state.go('result');

    }, (err) => {
      alert(err);
    })
    }
    constructor(
      private TaxService: app.TaxService,
      private $state: ng.ui.IStateService
    ) {

    }
  }
  angular.module('app').controller('TaxCreateTaxController', TaxCreateTaxController);
}
