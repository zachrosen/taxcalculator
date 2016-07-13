var app;
(function (app) {
    var TaxService = (function () {
        function TaxService($resource, $http, $q) {
            this.$resource = $resource;
            this.$http = $http;
            this.$q = $q;
            this.data = {};
            this.TaxResource = $resource('/api/v1/tax/:id', null, { 'update': { 'method': 'PUT' } });
        }
        TaxService.prototype.createTax = function (tax) {
            return this.TaxResource.save(tax).$promise;
        };
        return TaxService;
    }());
    app.TaxService = TaxService;
    angular.module('app').service('TaxService', TaxService);
})(app || (app = {}));
