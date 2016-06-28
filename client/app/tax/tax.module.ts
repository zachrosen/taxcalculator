namespace app {
  angular.module('app').config((
    $stateProvider: ng.ui.IStateProvider
  ) => {
    $stateProvider.state('tax main', {
      url: '/',
      templateUrl: '/client/app/tax/createtax/tax.createtax.html',
      controller: 'TaxCreateTaxController as vm'
    })
    .state('result', {
      url:'/result',
      templateUrl: '/client/app/tax/result/tax.result.html',
      controller: 'TaxResultController as vm'
    })
  });
}
