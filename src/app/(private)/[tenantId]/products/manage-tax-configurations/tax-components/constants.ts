const PAGE_TITLE = "tax component";
const ENDPOINT = "tax-components";
const QUERY_KEY = ENDPOINT;

export { ENDPOINT, PAGE_TITLE, QUERY_KEY };

export const updatePermissions = ["UPDATE_PRODUCTMIX", "ALL_FUNCTIONS"];
export const readPermissions = [
  "READ_PRODUCTMIX",
  "ALL_FUNCTIONS",
  "ALL_FUNCTIONS_READ",
];
export const deletePermissions = ["DELETE_PRODUCTMIX", "ALL_FUNCTIONS"];
export const createPermissions = ["CREATE_PRODUCTMIX", "ALL_FUNCTIONS"];
