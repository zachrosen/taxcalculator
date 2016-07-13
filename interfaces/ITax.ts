interface ITax {
_id: any;
salary: number;
age: number;
spouseAge: number;
isBlind: boolean;
isDependent: boolean;
isRenter: boolean;
spouseBlind: boolean;
filingType: string;
retirement: number;
alimony: number;
studentLoanInterest: number;
federalDeductionsTable: Array<{}>;
numberOfExemptions: number;
creditTable: Array<{}>;
additionalFederalAmount: number;
state: string;
type: string;
amount: number;
stateDeductionsTable: Array<{}>;
additionalStateAmount: number;

}
