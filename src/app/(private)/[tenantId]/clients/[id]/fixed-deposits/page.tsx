"use client";
import { useGetById } from "@/api";
import Alert_ from "@/components/alert";
import CreateModal from "./create.modal";
import PageHeader from "@/components/page-header";
import { Client } from "@/types";
import DataTable from "./data-table";
import SavingsCreateModal from "./create.modal";

export default function Page() {
  // const {
  //   status: clientLoansStatus,
  //   data: clientLoans,
  //   error: clientLoansError,
  // } = useGetById<Client>(`clients`, params.id);

  return (
    <div>
      {/* <PageHeader
        pageTitle={`John Doe`}
        createModal={<SavingsCreateModal submitType="create" client={} />}
      /> */}

      {/* {clientLoansStatus === "error" ? (
        <Alert_
          message={"Error"}
          description={clientLoansError.message}
          type={"error"}
        />
      ) : (
        <DataTable
          data={clientLoans}
          loading={clientLoansStatus === "pending" ? true : false}
        />
      )} */}
    </div>
  );
}
