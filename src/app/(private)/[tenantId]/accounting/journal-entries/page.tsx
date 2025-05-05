"use client";
import { useGet } from "@/api";
import Alert_ from "@/components/alert";
import PageHeader from "@/components/page-header";
import pluralize from "pluralize";
import { ENDPOINT, PAGE_TITLE, QUERY_KEY } from "./constants";
import DataTable from "./data-table";
import CreateModal from "@/components/create.modal";
import CreateForm from "./create.form";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function Page() {
  const { tenantId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    status,
    data: glJournalEntries,
    error,
  } = useGet(`${tenantId}/${ENDPOINT}`, [`${tenantId}/${QUERY_KEY}`]);

  // Default frequentPostings to false for now, since it's optional
  const frequentPostings = false;

  return (
    <div>
      <PageHeader
        pageTitle={
          !frequentPostings ? pluralize(PAGE_TITLE) : "Frequent Postings"
        }
        createModal={
          <CreateModal
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            pageTitle={
              !frequentPostings ? pluralize(PAGE_TITLE) : "Frequent Postings"
            }
            CreateForm={
              <CreateForm
                handleCancel={function (): void {
                  throw new Error("Function not implemented.");
                }}
                frequentPostings={frequentPostings}
                setIsModalOpen={setIsModalOpen}
              />
            }
            width={1000}
          />
        }
      />

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
