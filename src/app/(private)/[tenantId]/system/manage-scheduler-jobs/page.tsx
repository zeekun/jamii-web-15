"use client";
import { useGet } from "@/api";
import Alert_ from "@/components/alert";
import PageHeader from "@/components/page-header";
import pluralize from "pluralize";
import { ENDPOINT, PAGE_TITLE, QUERY_KEY } from "./constants";
import CreateModal from "@/components/create.modal";
import DataTable from "./data-table";
import CreateForm from "./create.form";
import { useState } from "react";
import { useParams } from "next/navigation";

export default function Page() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { tenantId } = useParams();
  const {
    status,
    data: accountingNumberPreferences,
    error,
  } = useGet(`${tenantId}/${ENDPOINT}`, [QUERY_KEY]);

  return (
    <div>
      <PageHeader pageTitle={pluralize(PAGE_TITLE)} />

      {status === "error" ? (
        <Alert_ message={"Error"} description={error} type={"error"} />
      ) : (
        <DataTable
          data={accountingNumberPreferences}
          loading={status === "pending" ? true : false}
        />
      )}
    </div>
  );
}
