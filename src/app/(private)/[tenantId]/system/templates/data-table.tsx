// templates/data-table.tsx
"use client";
import { Template } from "@/types";
import { type TableProps } from "antd";
import { useState } from "react";
import MyDataTable from "@/components/data-table";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ENTITY_TYPES, TEMPLATE_TYPES } from "./constants";
import TableRowStatus from "@/components/table-row-status";

export default function DataTable(props: { data: any; loading: boolean }) {
  const [searchedText, setSearchedText] = useState("");
  const { data, loading } = props;
  const { tenantId } = useParams();

  const columns: TableProps<Template>["columns"] = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (_, record) => (
        <Link href={`/${tenantId}/templates/${record.id}`}>{record.name}</Link>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
      filteredValue: [searchedText],
      onFilter: (value, record) => {
        const v = value as string;
        return (
          String(record.name).toLowerCase().includes(v.toLowerCase()) ||
          String(record.description).toLowerCase().includes(v.toLowerCase())
        );
      },
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type) =>
        TEMPLATE_TYPES.find((t) => t.value === type)?.label || type,
    },
    {
      title: "Entity",
      dataIndex: "entity",
      key: "entity",
      render: (entity) =>
        ENTITY_TYPES.find((e) => e.value === entity)?.label || entity,
    },
    {
      title: "Transaction Point",
      dataIndex: "entity",
      key: "entity",
      render: (_, record) => record.transactionPoint,
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (_, record) => <TableRowStatus status={_} />,
    },
  ];

  return (
    <MyDataTable<Template>
      columns={columns}
      data={data}
      loading={loading}
      tableHeader={{ setSearchedText }}
      rowType="Template"
    />
  );
}
