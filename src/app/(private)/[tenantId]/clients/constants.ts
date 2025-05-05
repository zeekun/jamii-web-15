import pluralize from "pluralize";

export const PAGE_TITLE = "client";
export const ENDPOINT = pluralize(PAGE_TITLE);
export const QUERY_KEY = ENDPOINT;
export const MODAL_WIDTH = 1000;

export const readClientPermissions = [
  "READ_CLIENT",
  "ALL_FUNCTIONS",
  "ALL_FUNCTIONS_READ",
];

export const createClientPermissions = ["CREATE_CLIENT", "ALL_FUNCTIONS"];
export const updateClientPermissions = ["UPDATE_CLIENT", "ALL_FUNCTIONS"];
export const createClientImagePermissions = [
  "CREATE_CLIENTIMAGE",
  "ALL_FUNCTIONS",
];
export const deleteClientImagePermissions = [
  "DELETE_CLIENTIMAGE",
  "ALL_FUNCTIONS",
];
export const closeClientPermissions = ["CLOSE_CLIENT", "ALL_FUNCTIONS"];
export const assignStaffClientPermissions = [
  "ASSIGNSTAFF_CLIENT",
  "ALL_FUNCTIONS",
];
export const unassignStaffClientPermissions = [
  "UNASSIGNSTAFF_CLIENT",
  "ALL_FUNCTIONS",
];

export const proposeTransferClientPermissions = [
  "PROPOSETRANSFER_CLIENT",
  "ALL_FUNCTIONS",
];

export const proposeAndAcceptTransferClientPermissions = [
  "PROPOSEANDACCEPTTRANSFER_CLIENT",
  "ALL_FUNCTIONS",
];
