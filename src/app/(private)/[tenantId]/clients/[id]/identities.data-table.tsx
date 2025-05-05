"use client";
import { useGet } from "@/api";
import Alert_ from "@/components/alert";
import CreateModal from "@/components/create.modal";
import TableHeader from "@/components/table-header";
import { ClientIdentifier } from "@/types";
import type { TableProps } from "antd";
import { Table } from "antd";
import { useParams } from "next/navigation";
import { useState } from "react";
import CreateClientIdentityForm from "./create-client-identity.form";
import PageHeader from "@/components/page-header";

export default function IdentitiesDataTable() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { tenantId } = useParams();
  const { id } = useParams();

  const { data, status, error } = useGet<ClientIdentifier[]>(
    `${tenantId}/clients/${id}/client-identifiers`,
    [`${tenantId}/clients/${id}/client-identifiers`]
  );

  const [searchedText, setSearchedText] = useState("");
  const columns: TableProps<ClientIdentifier>["columns"] = [
    {
      title: "Name",
      dataIndex: "firstName",
      key: "firstName",
      render: (_, record) => <a>{record.documentType.codeValue}</a>,
    },
  ];

  return (
    <>
      <PageHeader
        pageTitle={"Identity"}
        createModal={
          <CreateModal
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            pageTitle={"Identity"}
            submitType="create"
            CreateForm={<CreateClientIdentityForm />}
          />
        }
      />

      <TableHeader setSearchedText={setSearchedText} />
      {status === "error" ? (
        <Alert_ message={"Error"} description={error} type={"error"} />
      ) : (
        <Table
          columns={columns}
          dataSource={data}
          loading={status === "pending" ? true : false}
        />
      )}
    </>
  );
}
