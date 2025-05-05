const PAGE_TITLE = "savings product";
const ENDPOINT = "savings-products";
const QUERY_KEY = ENDPOINT;
const MODAL_WIDTH = 1000;

export const createPermissions = ["CREATE_SAVINGSPRODUCT", "ALL_FUNCTIONS"];
export const updatePermissions = ["UPDATE_SAVINGSPRODUCT", "ALL_FUNCTIONS"];
export const readPermissions = [
  "READ_SAVINGSPRODUCT",
  "ALL_FUNCTIONS",
  "ALL_FUNCTIONS_READ",
];
export const deletePermissions = ["DELETE_SAVINGSPRODUCT", "ALL_FUNCTIONS"];

export { ENDPOINT, PAGE_TITLE, QUERY_KEY, MODAL_WIDTH };
