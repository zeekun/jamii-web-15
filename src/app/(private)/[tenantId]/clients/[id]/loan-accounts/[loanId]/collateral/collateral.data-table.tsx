"use client";
import type { TableProps } from "antd";
import { Table } from "antd";
import { LoanCollateral } from "@/types";
import CollateralForm from "./collateral.form";
import CreateModal from "@/components/create.modal";
import { useParams } from "next/navigation";
import { useGet } from "@/api";
import Alert_ from "@/components/alert";
import { formatNumber } from "@/utils/numbers";
import { useState } from "react";
import MyDataTable from "@/components/data-table";

export default function CollateralDataTable() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { tenantId, id, loanId } = useParams();
  const { status, data, error } = useGet<LoanCollateral[]>(
    `${tenantId}/loans/${loanId}/loan-collaterals`,
    [`${tenantId}/loans/${loanId}/loan-collaterals`]
  );

  const columns: TableProps<LoanCollateral>["columns"] = [
    {
      title: "Type",
      dataIndex: "typeId",
      key: "typeId",
      render: (_, record) => record.type.codeValue,
    },
    {
      title: "Value",
      dataIndex: "value",
      key: "value",
      render: (text: any) => formatNumber(text),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text: any) => text,
    },
  ];

  return (
    <>
      <div className="mb-5 flex justify-end">
        <CreateModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          pageTitle={"Collateral"}
          submitType="create"
          CreateForm={<CollateralForm />}
        />
      </div>

      {status === "error" ? (
        <Alert_ message={"Error"} description={error} type={"error"} />
      ) : (
        <MyDataTable<LoanCollateral>
          columns={columns}
          data={data || []}
          redirectUrl={`/${tenantId}/clients/${id}/loan-accounts/${loanId}/collateral`}
          loading={status === "pending" ? true : false}
        />
      )}
    </>
  );
}
