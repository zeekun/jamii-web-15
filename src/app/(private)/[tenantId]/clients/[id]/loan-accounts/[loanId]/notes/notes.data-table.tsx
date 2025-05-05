"use client";
import type { TableProps } from "antd";
import { Table } from "antd";
import { Note } from "@/types";
import MyDataTable from "@/components/data-table";
import { useParams } from "next/navigation";
import { formattedDate } from "@/utils/dates";

export default function DataTable(props: { data: any; status: boolean }) {
  const { tenantId, id, loanId } = useParams();
  const { data, status } = props;

  const columns: TableProps<Note>["columns"] = [
    {
      title: "Note",
      dataIndex: "note",
      key: "note",
      render: (text: any) => text,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text: any) => formattedDate(text, "HH:mm:ss A DD MMM YYYY"),
    },
  ];

  return (
    <MyDataTable<Note>
      columns={columns}
      data={data || []}
      redirectUrl={`/${tenantId}/clients/${id}/loan-accounts/${loanId}/notes`}
      loading={status}
    />
  );
}
