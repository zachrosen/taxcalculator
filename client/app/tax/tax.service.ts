namespace app {
  interface ITaxResourceClass extends ng.resource.IResource<ITaxResourceClass>, ITax{}
  interface ITaxResource extends ng.resource.IResourceClass<ITaxResourceClass>{
    update(params:Object);
    update(params:Object, body:Object);
  }
  export class TaxService {
    private TaxResource: ITaxResource;

    public data = {

    salary: {},
    filingType: {}

    };

    public createTax(tax:ITax) {
      return this.TaxResource.save(tax).$promise;
    }












    constructor(
      private $resource: ng.resource.IResourceService,
      private $http: ng.IHttpService,
    private $q: ng.IQService
    ) {
    this.TaxResource = <ITaxResource>$resource('/api/v1/tax/:id',
    null, {'update': {'method': 'PUT'}});
    }
  }
  angular.module('app').service('TaxService', TaxService);
}
