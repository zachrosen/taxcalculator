var app;
(function (app) {
    angular.module('app').config(function ($stateProvider) {
        $stateProvider.state('tax main', {
            url: '/',
            templateUrl: '/client/app/tax/createtax/tax.createtax.html',
            controller: 'TaxCreateTaxController as vm'
        })
            .state('result', {
            url: '/result',
            templateUrl: '/client/app/tax/result/tax.result.html',
            controller: 'TaxResultController as vm'
        });
    });
})(app || (app = {}));
