export const PAGE_TITLE = "Template";
export const ENDPOINT = "templates";
export const QUERY_KEY = "templates";

export const updatePermissions = ["UPDATE_TEMPLATE", "ALL_FUNCTIONS"];
export const readPermissions = [
  "READ_TEMPLATE",
  "ALL_FUNCTIONS",
  "ALL_FUNCTIONS_READ",
];
export const deletePermissions = ["DELETE_TEMPLATE", "ALL_FUNCTIONS"];
export const createPermissions = ["CREATE_TEMPLATE", "ALL_FUNCTIONS"];

export const TEMPLATE_TYPES = [
  { value: "DOCUMENT", label: "Document" },
  { value: "EMAIL", label: "Email" },
  { value: "SMS", label: "SMS" },
];

export const ENTITY_TYPES = [
  { value: "CLIENT", label: "Client" },
  { value: "LOAN", label: "Loan" },
  { value: "SAVINGS", label: "Savings" },
  { value: "GROUP", label: "Group" },
  { value: "CENTER", label: "Center" },
];

export const ENTITY_HANDLEBARS = {
  CLIENT: [
    { label: "Name", value: "{{client.name}}" },
    { label: "Account No", value: "{{client.accountNo}}" },
    { label: "Mobile No", value: "{{client.mobileNo}}" },
  ],
  LOAN: [
    { label: "Name", value: "{{client.name}}" },
    { label: "Account No", value: "{{loan.accountNo}}" },
    { label: "Amount", value: "{{loan.amount}}" },
    { label: "Interest Rate", value: "{{loan.interestRate}}" },
    { label: "Due Date", value: "{{loan.dueDate}}" },
    { label: "Transaction ID", value: "{{loan.transactionId}}" },
  ],
  SAVINGS: [
    { label: "Name", value: "{{client.name}}" },
    { label: "Account No", value: "{{savings.accountNo}}" },
    { label: "Amount", value: "{{savings.amount}}" },
    { label: "Interest Rate", value: "{{savings.interestRate}}" },
    { label: "Transaction ID", value: "{{savings.transactionId}}" },
  ],
  // Add other entities as needed
} as const;

export interface TransactionPoint {
  value: string;
  label: string;
}

export const TRANSACTION_POINTS: Record<string, readonly TransactionPoint[]> = {
  SAVINGS: [
    { value: "DEPOSIT", label: "Deposit" },
    { value: "WITHDRAWAL", label: "Withdrawal" },
    { value: "INTEREST_CALCULATION", label: "Interest Calculation" },
  ] as const,
  LOAN: [
    { value: "DISBURSEMENT", label: "Disbursement" },
    { value: "REPAYMENT", label: "Repayment" },
    { value: "DELINQUENCY", label: "Delinquency" },
  ] as const,
} as const;
