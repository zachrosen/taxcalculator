namespace app {
  export class TaxResultController {
    public data;






    constructor(private TaxService: app.TaxService,
    private $state: ng.ui.IStateService) {

  this.data = TaxService.data;
    }

  }
  angular.module('app').controller('TaxResultController', TaxResultController);
}
