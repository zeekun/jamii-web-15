import pluralize from "pluralize";

const PAGE_TITLE = "support-ticket";
const ENDPOINT = pluralize(PAGE_TITLE);
const QUERY_KEY = ENDPOINT;
const MODAL_WIDTH = 800;

export const readPermissions = [
  "READ_ALL_SUPPORT_TICKET",
  "ALL_FUNCTIONS",
  "ALL_FUNCTIONS_READ",
];

export { ENDPOINT, PAGE_TITLE, QUERY_KEY, MODAL_WIDTH };
