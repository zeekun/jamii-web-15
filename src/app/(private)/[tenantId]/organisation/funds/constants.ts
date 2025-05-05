import pluralize from "pluralize";

export const PAGE_TITLE = "fund";
export const ENDPOINT = pluralize(PAGE_TITLE);
export const QUERY_KEY = ENDPOINT;
export const CREATE_MODAL_WIDTH = 600;

export const createPermissions = ["CREATE_FUND", "ALL_FUNCTIONS"];
export const updatePermissions = ["UPDATE_FUND", "ALL_FUNCTIONS"];
export const readPermissions = [
  "READ_FUND",
  "ALL_FUNCTIONS",
  "ALL_FUNCTIONS_READ",
];
export const deletePermissions = ["DELETE_FUND", "ALL_FUNCTIONS"];
