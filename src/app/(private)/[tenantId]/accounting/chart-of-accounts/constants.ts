const PAGE_TITLE = "chart of account";
const ENDPOINT = "gl-accounts";
const QUERY_KEY = ENDPOINT;
const CREATE_MODAL_WIDTH = 1000;

export const createPermissions = ["CREATE_GLACCOUNT", "ALL_FUNCTIONS"];
export const updatePermissions = ["UPDATE_GLACCOUNT", "ALL_FUNCTIONS"];
export const readPermissions = [
  "READ_GLACCOUNT",
  "ALL_FUNCTIONS",
  "ALL_FUNCTIONS_READ",
];
export const deletePermissions = ["DELETE_GLACCOUNT", "ALL_FUNCTIONS"];

export { CREATE_MODAL_WIDTH, ENDPOINT, PAGE_TITLE, QUERY_KEY };
