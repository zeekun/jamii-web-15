"use client";
import { useGet } from "@/api";
import Alert_ from "@/components/alert";
import PageHeader from "@/components/page-header";
import pluralize from "pluralize";
import { ENDPOINT, PAGE_TITLE, QUERY_KEY } from "./constants";
import CreateModal from "./create.modal";
import DataTable from "./data-table";
import { useParams } from "next/navigation";

export default function SavingsPage() {
  const { tenantId } = useParams();
  const {
    status,
    data: savings,
    error,
  } = useGet(
    `${tenantId}/${ENDPOINT}?filter={"where":{"depositTypeEnum":"RECURRING DEPOSIT"}}`,
    [
      `${tenantId}/${ENDPOINT}?filter={"where":{"depositTypeEnum":"RECURRING DEPOSIT"}}`,
    ]
  );

  return (
    <div>
      <PageHeader
        pageTitle={pluralize(PAGE_TITLE)}
        createModal={<CreateModal submitType="create" />}
      />

      {status === "error" ? (
        <Alert_ message={"Error"} description={error} type={"error"} />
      ) : (
        <DataTable
          data={savings}
          loading={status === "pending" ? true : false}
        />
      )}
    </div>
  );
}
