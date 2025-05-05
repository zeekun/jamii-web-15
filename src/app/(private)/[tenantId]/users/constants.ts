import pluralize from "pluralize";

const PAGE_TITLE = "user";
const ENDPOINT = pluralize(PAGE_TITLE);
const QUERY_KEY = ENDPOINT;
const PAGE_URL = ENDPOINT;

export { ENDPOINT, PAGE_TITLE, QUERY_KEY, PAGE_URL };
