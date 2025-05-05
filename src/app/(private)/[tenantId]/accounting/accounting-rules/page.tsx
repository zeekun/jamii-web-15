"use client";
import { useGet } from "@/api";
import Alert_ from "@/components/alert";
import CreateModal from "@/components/create.modal";
import PageHeader from "@/components/page-header";
import pluralize from "pluralize";
import {
  CREATE_MODAL_WIDTH,
  ENDPOINT,
  PAGE_TITLE,
  QUERY_KEY,
} from "./constants";
import CreateForm from "./create.form";
import DataTable from "./data-table";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function AccountingRulePage() {
  const { tenantId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    status,
    data: accountingRules,
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
            CreateForm={
              <CreateForm submitType="create" setIsModalOpen={setIsModalOpen} />
            }
            submitType="create"
            width={CREATE_MODAL_WIDTH}
          />
        }
      />

      {status === "error" ? (
        <Alert_ message={"Error"} description={error} type={"error"} />
      ) : (
        <DataTable
          data={accountingRules}
          loading={status === "pending" ? true : false}
        />
      )}
    </div>
  );
}
