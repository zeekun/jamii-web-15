"use client";
import { useGet } from "@/api";
import Alert_ from "@/components/alert";
import PageHeader from "@/components/page-header";
import pluralize from "pluralize";
import { useParams } from "next/navigation";
import { useState } from "react";
import DataTable from "../data-table";
import { ENDPOINT, PAGE_TITLE, QUERY_KEY } from "../constants";
import { GlJournalEntry } from "@/types";
import SearchFilter from "./search-filter";

export default function Page() {
  const { tenantId } = useParams();
  const [filters, setFilters] = useState<{ [key: string]: string }>({
    transactionId: "",
    glAccountId: "",
    typeEnum: "",
  });

  // Construct the filter in the required format
  const constructFilter = (filters: { [key: string]: string }) => {
    const filterConditions = Object.entries(filters)
      .filter(([_, value]) => value.trim() !== "")
      .map(([key, value]) => ({ [key]: value }));

    if (filterConditions.length === 0) {
      return JSON.stringify({});
    }

    if (filterConditions.length === 1) {
      return JSON.stringify({ where: filterConditions[0] });
    }

    return JSON.stringify({ where: { and: filterConditions } });
  };

  // Check if any filter is applied
  const hasFilters = Object.values(filters).some(
    (value) => value.trim() !== ""
  );

  // Construct the API endpoint with or without the filter
  const apiEndpoint = hasFilters
    ? `${tenantId}/${ENDPOINT}?filter=${constructFilter(filters)}`
    : `${tenantId}/${ENDPOINT}`;

  const {
    status,
    data: glJournalEntries,
    error,
  } = useGet<GlJournalEntry[]>(apiEndpoint, [
    `${tenantId}/${QUERY_KEY}`,
    apiEndpoint, // Re-fetch data when filters or endpoint changes
  ]);

  const handleSearch = (newFilters: { [key: string]: string }) => {
    setFilters(newFilters);
  };

  return (
    <div>
      <PageHeader pageTitle={`Search ${pluralize(PAGE_TITLE)}`} />
      <SearchFilter onSearch={handleSearch} />

      {status === "error" ? (
        <Alert_ message={"Error"} description={error} type={"error"} />
      ) : (
        <DataTable
          data={glJournalEntries}
          loading={status === "pending" ? true : false}
        />
      )}
    </div>
  );
}
