namespace app {
  export class TaxResultController {

    public tax: ITax[];

    constructor(private TaxService: app.TaxService,
    private $state: ng.ui.IStateService) {
    this.tax = TaxService.get();
    }
  }
  angular.module('app').controller('TaxResultController', TaxResultController);
}
