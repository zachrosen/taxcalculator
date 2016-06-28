namespace app {
  angular.module('app').config((
    $stateProvider: ng.ui.IStateProvider
  ) => {
    $stateProvider.state('tax main', {
      url: '/',
      templateUrl: '/client/app/tax/createtax/tax.createtax.html',
      controller: 'TaxCreateTaxController as vm'
    })
  });
}
