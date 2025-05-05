import pluralize from "pluralize";

const PAGE_TITLE = "charge";
const ENDPOINT = pluralize(PAGE_TITLE);
const QUERY_KEY = ENDPOINT;

const chargeTimeTypeLoanOptions = [
  {
    value: "DISBURSEMENT",
    label: "Disbursement",
  },
  {
    value: "SPECIFIED DUE DATE",
    label: "Specified Due Date",
  },
  {
    value: "INSTALLMENT FEE",
    label: "Installment Fee",
  },
  {
    value: "OVERDUE FEE",
    label: "Overdue Fee",
  },
  {
    value: "TRANCHE DISBURSEMENT",
    label: "Tranche Disbursement",
  },
];

const chargeTimeTypeSavingOptions = [
  {
    value: "SPECIFIED DUE DATE",
    label: "Specified Due Date",
  },
  {
    value: "SAVINGS ACTIVATION",
    label: "Savings Activation",
  },
  {
    value: "WITHDRAWAL FEE",
    label: "Withdrawal Fee",
  },
  {
    value: "ANNUAL FEE",
    label: "Annual Fee",
  },
  {
    value: "MONTHLY FEE",
    label: "Monthly Fee",
  },
  {
    value: "WEEKLY FEE",
    label: "Weekly Fee",
  },
  {
    value: "OVERDRAFT FEE",
    label: "Overdraft Fee",
  },
  {
    value: "SAVINGS NO ACTIVITY FEE",
    label: "Savings No Activity Fee",
  },
];

const chargeTimeTypeClientOptions = [
  {
    value: "SPECIFIED DUE DATE",
    label: "Specified Due Date",
  },
];

const chargeTimeTypeShareOptions = [
  {
    value: "SHARE ACCOUNT ACTIVATE",
    label: "Share Account Activate",
  },
  {
    value: "SHARE PURCHASE",
    label: "Share Purchase",
  },
  {
    value: "SHARE REDEEM",
    label: "Share Redeem",
  },
];

const chargeCalculationTypeLoanOptions = [
  {
    value: "FLAT",
    label: "Flat",
  },
  {
    value: "% APPROVED AMOUNT",
    label: "% Approved Amount",
  },
  {
    value: "% LOAN AMOUNT + INTEREST",
    label: "% Loan Amount + Interest",
  },
  {
    value: "% INTEREST",
    label: "% Interest",
  },
];

const chargeCalculationTypeSavingOptions = [
  {
    value: "FLAT",
    label: "Flat",
  },
  {
    value: "% APPROVED AMOUNT",
    label: "% Approved Amount",
  },
];

const chargeCalculationTypeClientOptions = [
  {
    value: "FLAT",
    label: "Flat",
  },
];

const chargeCalculationTypeShareOptions = [
  {
    value: "FLAT",
    label: "Flat",
  },
  {
    value: "% APPROVED AMOUNT",
    label: "% Approved Amount",
  },
];

export {
  ENDPOINT,
  PAGE_TITLE,
  QUERY_KEY,
  chargeTimeTypeLoanOptions,
  chargeTimeTypeSavingOptions,
  chargeTimeTypeClientOptions,
  chargeTimeTypeShareOptions,
  chargeCalculationTypeLoanOptions,
  chargeCalculationTypeSavingOptions,
  chargeCalculationTypeClientOptions,
  chargeCalculationTypeShareOptions,
};

export const createPermissions = ["CREATE_CHARGE", "ALL_FUNCTIONS"];
export const updatePermissions = ["UPDATE_CHARGE", "ALL_FUNCTIONS"];
export const readPermissions = [
  "READ_CHARGE",
  "ALL_FUNCTIONS",
  "ALL_FUNCTIONS_READ",
];
export const deletePermissions = ["DELETE_CHARGE", "ALL_FUNCTIONS"];
