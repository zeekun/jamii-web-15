import pluralize from "pluralize";

export const PAGE_TITLE = "group";
export const ENDPOINT = pluralize(PAGE_TITLE);
export const QUERY_KEY = ENDPOINT;
export const MODAL_WIDTH = 800;

export const readGroupPermissions = [
  "READ_GROUP",
  "ALL_FUNCTIONS",
  "ALL_FUNCTIONS_READ",
];
export const updateGroupPermissions = ["UPDATE_GROUP", "ALL_FUNCTIONS"];
export const unassignStaffGroupPermissions = [
  "UNASSIGNSTAFF_GROUP",
  "ALL_FUNCTIONS",
];
export const assignStaffGroupPermissions = [
  "ASSIGNSTAFF_GROUP",
  "ALL_FUNCTIONS",
];
export const closeGroupPermissions = ["CLOSE_GROUP", "ALL_FUNCTIONS"];
export const deleteGroupPermissions = ["DELETE_GROUP", "ALL_FUNCTIONS"];

export const associateClientsGroupsPermissions = [
  "ASSOCIATECLIENTS_GROUP",
  "ALL_FUNCTIONS",
];

export const disassociateClientsGroupsPermissions = [
  "DISASSOCIATECLIENTS_GROUP",
  "ALL_FUNCTIONS",
];

export const assignRoleGroupPermissions = ["ASSIGNROLE_GROUP", "ALL_FUNCTIONS"];
export const unassignRoleGroupPermissions = [
  "UNASSIGNROLE_GROUP",
  "ALL_FUNCTIONS",
];
export const updateRoleGroupPermissions = ["UPDATEROLE_GROUP", "ALL_FUNCTIONS"];
