namespace app {
  interface ITaxResourceClass extends ng.resource.IResource<ITaxResourceClass>, ITax{}
  interface ITaxResource extends ng.resource.IResourceClass<ITaxResourceClass>{
    update(params:Object);
    update(params:Object, body:Object);
  }
  export class TaxService {
    private TaxResource: ITaxResource;

    public get() {
            return this.TaxResource.query();
        }

    public createTax(tax:ITax) {
      return this.TaxResource.save(tax).$promise;
    }
    constructor(
      private $resource: ng.resource.IResourceService
    ) {
    this.TaxResource = <ITaxResource>$resource('/api/v1/tax',
    null, {'update': {'method': 'PUT'}});
    }
  }
  angular.module('app').service('TaxService', TaxService);
}
