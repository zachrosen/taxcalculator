var app;
(function (app) {
    var TaxResultController = (function () {
        function TaxResultController(TaxService, $state) {
            this.TaxService = TaxService;
            this.$state = $state;
            this.data = TaxService.data;
        }
        return TaxResultController;
    }());
    app.TaxResultController = TaxResultController;
    angular.module('app').controller('TaxResultController', TaxResultController);
})(app || (app = {}));
