"use client";
import { useGet } from "@/api";
import Alert_ from "@/components/alert";
import CreateModal from "@/components/create.modal";
import PageHeader from "@/components/page-header";
import pluralize from "pluralize";
import { ENDPOINT, PAGE_TITLE, QUERY_KEY } from "./constants";
import CreateForm from "./create.form";
import DataTable from "./data-table";
import { useState } from "react";

export default function Page() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { status, data: roles, error } = useGet(ENDPOINT, [QUERY_KEY]);

  return (
    <div>
      <PageHeader
        pageTitle={pluralize(PAGE_TITLE)}
        createModal={
          <CreateModal
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            pageTitle={PAGE_TITLE}
            CreateForm={<CreateForm setIsModalOpen={setIsModalOpen} />}
          />
        }
      />

      {status === "error" ? (
        <Alert_ message={"Error"} description={error} type={"error"} />
      ) : (
        <DataTable data={roles} loading={status === "pending" ? true : false} />
      )}
    </div>
  );
}
