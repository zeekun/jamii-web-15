const PAGE_TITLE = "fixed deposit products";
const ENDPOINT = "savings-products";
const QUERY_KEY = "fixed-deposit-products";
const MODAL_WIDTH = 1200;

export const createPermissions = [
  "CREATE_FIXEDDEPOSITPRODUCT",
  "ALL_FUNCTIONS",
];
export const updatePermissions = [
  "UPDATE_FIXEDDEPOSITPRODUCT",
  "ALL_FUNCTIONS",
];
export const readPermissions = [
  "READ_FIXEDDEPOSITPRODUCT",
  "ALL_FUNCTIONS",
  "ALL_FUNCTIONS_READ",
];
export const deletePermissions = [
  "DELETE_FIXEDDEPOSITPRODUCT",
  "ALL_FUNCTIONS",
];

export { ENDPOINT, PAGE_TITLE, QUERY_KEY, MODAL_WIDTH };
