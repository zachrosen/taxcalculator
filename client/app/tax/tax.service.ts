namespace app {
  export class TaxService {

    constructor(
      private $resource: ng.resource.IResourceService
    ) {

    }
  }
  angular.module('app').service('TaxService', TaxService);
}
