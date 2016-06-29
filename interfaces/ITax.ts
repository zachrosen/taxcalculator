interface ITax {
_id: any;
salary: number;
age65: boolean;
blind: boolean;
dependent: boolean;
filingType: string;
retirement: number;
alimony: number;
studentLoanInterest: number;
federalDeductions: Array<string|number>;
personalExemptions: number;
credits: Array<string|number>;
aditionalFederalAmount: number;
state: string;
stateDeductions: Array<string|number>;

}
