"use client";
import { useGet } from "@/api";
import Alert_ from "@/components/alert";
import CreateModal from "@/components/create.modal";
import PageHeader from "@/components/page-header";
import pluralize from "pluralize";
import { PAGE_TITLE } from "./constants";
import CreateForm from "./create.form";
import DataTable from "./data-table";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Tenant } from "@/types";

export default function UsersPage() {
  const { tenantId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { status, data, error } = useGet<Tenant[]>(
    `${tenantId}/tenants?filter={"order":["id DESC"]}`,
    [`${tenantId}/tenants?filter={"order":["id DESC"]}`]
  );

  if (tenantId !== "1") {
    return (
      <Alert_ message={"Error"} description={"Page not found"} type={"error"} />
    );
  }

  return (
    <div>
      <PageHeader
        pageTitle={pluralize(PAGE_TITLE)}
        createModal={
          <CreateModal
            pageTitle={PAGE_TITLE}
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            submitType="create"
            CreateForm={<CreateForm setIsModalOpen={setIsModalOpen} />}
          />
        }
      />

      {status === "error" ? (
        <Alert_ message={"Error"} description={error} type={"error"} />
      ) : (
        <DataTable data={data} loading={status === "pending"} />
      )}
    </div>
  );
}
