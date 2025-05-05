"use client";
import type { TableProps } from "antd";
import { Document } from "@/types";
import MyDataTable from "@/components/data-table";
import { useParams } from "next/navigation";

export default function DataTable(props: { data: any; status: boolean }) {
  const { data, status } = props;
  const { tenantId, id, loanId } = useParams();

  const columns: TableProps<Document>["columns"] = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: any) => text,
    },
  ];

  return (
    <MyDataTable<Document>
      columns={columns}
      data={data || []}
      redirectUrl={`/${tenantId}/clients/${id}/loan-accounts/${loanId}/loan-documents`}
      loading={status}
    />
  );
}
