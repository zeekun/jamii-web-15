export const PAGE_TITLE = "role";
export const ENDPOINT = "roles";
export const QUERY_KEY = ENDPOINT;

export const readRolePermissions = [
  "READ_ROLE",
  "ALL_FUNCTIONS",
  "ALL_FUNCTIONS_READ",
];
export const createRolePermissions = ["CREATE_ROLE", "ALL_FUNCTIONS"];
export const updateRolePermissions = ["UPDATE_ROLE", "ALL_FUNCTIONS"];
export const deleteRolePermissions = ["DELETE_ROLE", "ALL_FUNCTIONS"];
export const enableRolePermissions = ["ENABLE_ROLE", "ALL_FUNCTIONS"];
export const disableRolePermissions = ["DISABLE_ROLE", "ALL_FUNCTIONS"];
