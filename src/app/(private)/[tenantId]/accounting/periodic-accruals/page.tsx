"use client";
import { useGet } from "@/api";
import Alert_ from "@/components/alert";
import PageHeader from "@/components/page-header";
import pluralize from "pluralize";
import { ENDPOINT, PAGE_TITLE, QUERY_KEY } from "./constants";
import CreateModal from "./create.modal";
import DataTable from "./data-table";
import { useTenantEndpoint } from "@/hooks/tenant-api";

export default function Page() {
  const { status, data, error } = useTenantEndpoint().useTenantGet(ENDPOINT, [
    QUERY_KEY,
  ]);

  return (
    <div>
      <PageHeader
        pageTitle={pluralize(PAGE_TITLE)}
        createModal={<CreateModal submitType="create" />}
      />

      {status === "error" ? (
        <Alert_ message={"Error"} description={error} type={"error"} />
      ) : (
        <DataTable data={data} loading={status === "pending" ? true : false} />
      )}
    </div>
  );
}
