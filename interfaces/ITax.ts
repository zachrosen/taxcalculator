interface ITax {
_id: any;
salary: number;
is65: boolean;
isBlind: boolean;
isDependent: boolean;
filingType: string;
retirement: number;
alimony: number;
studentLoanInterest: number;
federalDeductions: Array<string|number>;
numberOfExemptions: number;
credits: Array<string|number>;
aditionalFederalAmount: number;
state: string;
stateDeductions: Array<string|number>;

}
