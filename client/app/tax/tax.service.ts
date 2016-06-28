namespace app {
  interface ITaxResourceClass extends ng.resource.IResource<ITaxResourceClass>, ITax{}
  interface ITaxResource extends ng.resource.IResourceClass<ITaxResourceClass>{
    update(params:Object);
    update(params:Object, body:Object);
  }
  export class TaxService {
    private TaxResource: ITaxResource;

    public createTax(tax:ITax) {
      return this.TaxResource.save(tax).$promise.then((res) => {
        this.$state.go('result')
      }, (err) => {
        alert(err);
      })
    }
    constructor(
      private $resource: ng.resource.IResourceService,
      private $state: ng.ui.IStateService
    ) {

    }
  }
  angular.module('app').service('TaxService', TaxService);
}
