const PAGE_TITLE = "share product";
const ENDPOINT = "share-products";
const QUERY_KEY = ENDPOINT;
const MODAL_WIDTH = 1300;

export const createPermissions = ["CREATE_SHAREPRODUCT", "ALL_FUNCTIONS"];
export const updatePermissions = ["UPDATE_SHAREPRODUCT", "ALL_FUNCTIONS"];
export const readPermissions = [
  "READ_SHAREPRODUCT",
  "ALL_FUNCTIONS",
  "ALL_FUNCTIONS_READ",
];
export const deletePermissions = ["DELETE_SHAREPRODUCT", "ALL_FUNCTIONS"];

export { ENDPOINT, PAGE_TITLE, QUERY_KEY, MODAL_WIDTH };
