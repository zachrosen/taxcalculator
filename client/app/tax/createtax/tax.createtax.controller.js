var app;
(function (app) {
    var TaxCreateTaxController = (function () {
        function TaxCreateTaxController(TaxService, $state, $sce) {
            this.TaxService = TaxService;
            this.$state = $state;
            this.$sce = $sce;
            this.tax = { _id: null,
                salary: null,
                age: null,
                spouseAge: null,
                isBlind: null,
                isDependent: null,
                isRenter: null,
                spouseBlind: null,
                filingType: null,
                retirement: null,
                alimony: null,
                studentLoanInterest: null,
                federalDeductionsTable: [],
                numberOfExemptions: null,
                creditTable: [],
                additionalFederalAmount: null,
                state: null,
                type: null,
                amount: null,
                stateDeductionsTable: [],
                additionalStateAmount: null };
            this.federalDeductionsTable = [];
            this.creditTable = [];
            this.stateDeductionsTable = [];
            this.placement = {
                options: [
                    'top',
                    'top-left',
                    'top-right',
                    'bottom',
                    'bottom-left',
                    'bottom-right',
                    'left',
                    'left-top',
                    'left-bottom',
                    'right',
                    'right-top',
                    'right-bottom'
                ],
                selected: 'top'
            };
            this.htmlPopover1 = this.$sce.trustAsHtml("Filing Status: <a href='https://en.wikipedia.org/wiki/Filing_status' target='_blank'>Definition</a>");
            this.htmlPopover1point5 = this.$sce.trustAsHtml("Dependant: <a href='https://www.irs.gov/publications/p17/ch03.html#en_US_2015_publink1000170857' target='_blank'>Definition</a><br>Qualified Renter: <a href='https://www.ftb.ca.gov/individuals/faq/ivr/203.shtml' target='_blank'>Definition</a>");
            this.htmlPopover2 = this.$sce.trustAsHtml("Federal Adjustments: <a href='https://www.irs.gov/publications/p17/pt04.html' target='_blank'>Definition</a>");
            this.htmlPopover3 = this.$sce.trustAsHtml("Federal Deductions: <a href='https://www.irs.gov/uac/deductions' target='_blank'>Definition</a>");
            this.htmlPopover4 = this.$sce.trustAsHtml("Federal Personal Exemptions: <a href='https://www.irs.com/articles/personal-and-dependent-exemptions' target='_blank'>Definition</a>");
            this.htmlPopover5 = this.$sce.trustAsHtml("Federal Credits: <a href='https://www.irs.gov/credits-deductions/individuals' target='_blank'>Definition</a>");
            this.htmlPopover6 = this.$sce.trustAsHtml("This is the additional amount that is paid, to the federal government, as a buffer in case taxes are estimated or calculated incorrectly.");
            this.htmlPopover7 = this.$sce.trustAsHtml("California State Deductions: <a href='https://www.ftb.ca.gov/forms/2015_California_Tax_Rates_and_Exemptions.shtml#sd' target='_blank'>Definition</a>");
            this.htmlPopover8 = this.$sce.trustAsHtml("This is the additional amount that is paid, to the state, as a buffer in case taxes are estimated or calculated incorrectly.");
            this.tax.creditTable = [];
            this.tax.federalDeductionsTable = [];
            this.tax.stateDeductionsTable = [];
        }
        TaxCreateTaxController.prototype.addFederalDeduction = function () {
            this.tax.federalDeductionsTable.push({
                type: '',
                amount: parseInt('')
            });
        };
        TaxCreateTaxController.prototype.removeFederalDeduction = function (d) {
            this.tax.federalDeductionsTable.splice(this.tax.federalDeductionsTable.indexOf(d), 1);
        };
        TaxCreateTaxController.prototype.addCredit = function () {
            this.tax.creditTable.push({
                type: '',
                amount: parseInt('')
            });
        };
        TaxCreateTaxController.prototype.removeCredit = function (c) {
            this.tax.creditTable.splice(this.tax.creditTable.indexOf(c), 1);
        };
        TaxCreateTaxController.prototype.addStateDeduction = function () {
            this.tax.stateDeductionsTable.push({
                type: '',
                amount: parseInt('')
            });
        };
        TaxCreateTaxController.prototype.removeStateDeduction = function (s) {
            this.tax.stateDeductionsTable.splice(this.tax.stateDeductionsTable.indexOf(s), 1);
        };
        TaxCreateTaxController.prototype.createTax = function () {
            var _this = this;
            if (this.fedDeductions === "standardFederal") {
                this.tax.federalDeductionsTable = [];
            }
            if (this.fedDeductions === "standardState") {
                this.tax.stateDeductionsTable = [];
            }
            this.TaxService.createTax(this.tax).then(function (res) {
                _this.TaxService.data = res;
                _this.$state.go('result');
            }, function (err) {
                alert(err);
            });
        };
        ;
        return TaxCreateTaxController;
    }());
    app.TaxCreateTaxController = TaxCreateTaxController;
    angular.module('app').controller('TaxCreateTaxController', TaxCreateTaxController);
})(app || (app = {}));
