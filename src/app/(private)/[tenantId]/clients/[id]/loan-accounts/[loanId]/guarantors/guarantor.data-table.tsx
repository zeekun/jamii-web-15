"use client";
import type { TableProps } from "antd";
import { Guarantor } from "@/types";
import CreateModal from "@/components/create.modal";
import { useParams } from "next/navigation";
import { useGet } from "@/api";
import GuarantorForm from "./guarantor.form";
import { useState } from "react";
import MyDataTable from "@/components/data-table";
import _ from "lodash";

export default function GuarantorDataTable() {
  const { tenantId, id, loanId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { status, data, error } = useGet<Guarantor[]>(
    `${tenantId}/loans/${loanId}/guarantors`,
    [`${tenantId}/loans/${loanId}/guarantors`]
  );

  const columns: TableProps<Guarantor>["columns"] = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (_, record) => {
        const name = record.firstName
          ? `${record.firstName} ${record.middleName || ""} ${record.lastName}`
          : `${record.client?.firstName} ${record.client?.middleName || ""} ${
              record.client?.lastName
            }`;
        return name;
      },
    },
    {
      title: "Relationship",
      dataIndex: "relationship",
      key: "relationship",
      render: (_, record) => {
        return record.relationship?.codeValue;
      },
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (__, record) => {
        return <span className="capitalize">{_.toLower(record.typeEnum)}</span>;
      },
    },
  ];

  return (
    <>
      <div className="mb-5 flex justify-end">
        <CreateModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          pageTitle={"Guarantor"}
          submitType="create"
          CreateForm={<GuarantorForm setIsModalOpen={setIsModalOpen} />}
        />
      </div>

      <MyDataTable<Guarantor>
        columns={columns}
        data={data || []}
        redirectUrl={`/${tenantId}/clients/${id}/loan-accounts/${loanId}/guarantors`}
        loading={status === "pending" ? true : false}
      />
    </>
  );
}
