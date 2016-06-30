interface ITax {
_id: any;
salary: number;
age: number;
isBlind: boolean;
isDependent: boolean;
filingType: string;
retirement: number;
alimony: number;
studentLoanInterest: number;
federalDeductions: Array<string|number>;
numberOfExemptions: number;
creditTable: Array<string|number>;
aditionalFederalAmount: number;
state: string;
stateDeductions: Array<string|number>;

}
