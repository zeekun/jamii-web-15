"use client";
import { useGet } from "@/api";
import Alert_ from "@/components/alert";
import PageHeader from "@/components/page-header";
import pluralize from "pluralize";
import { ENDPOINT, PAGE_TITLE, QUERY_KEY } from "./constants";
import CreateModal from "@/components/create.modal";
import DataTable from "./data-table";
import CreateForm from "./create.form";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function Page() {
  const { tenantId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    status,
    data: floatingRates,
    error,
  } = useGet(`${tenantId}/${ENDPOINT}`, [`${tenantId}/${QUERY_KEY}`]);

  return (
    <div>
      <PageHeader
        pageTitle={pluralize(PAGE_TITLE)}
        createModal={
          <CreateModal
            pageTitle={PAGE_TITLE}
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            CreateForm={<CreateForm setIsModalOpen={setIsModalOpen} />}
            width={1200}
          />
        }
      />

      {status === "error" ? (
        <Alert_ message={"Error"} description={error} type={"error"} />
      ) : (
        <DataTable
          data={floatingRates}
          loading={status === "pending" ? true : false}
        />
      )}
    </div>
  );
}
