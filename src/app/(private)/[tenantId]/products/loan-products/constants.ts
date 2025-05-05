const PAGE_TITLE = "loan product";
const ENDPOINT = "loan-products";
const QUERY_KEY = ENDPOINT;
const MODAL_WIDTH = 1000;

export const createPermissions = ["CREATE_LOANPRODUCT", "ALL_FUNCTIONS"];
export const updatePermissions = ["UPDATE_LOANPRODUCT", "ALL_FUNCTIONS"];
export const readPermissions = [
  "READ_LOANPRODUCT",
  "ALL_FUNCTIONS",
  "ALL_FUNCTIONS_READ",
];
export const deletePermissions = ["DELETE_LOANPRODUCT", "ALL_FUNCTIONS"];

export { ENDPOINT, PAGE_TITLE, QUERY_KEY, MODAL_WIDTH };
