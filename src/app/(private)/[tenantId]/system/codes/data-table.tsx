"use client";
import MyDataTable from "@/components/data-table";
import TableRowCheck from "@/components/table-row-check";
import { Code } from "@/types";
import type { TableProps } from "antd";
import Link from "next/link";
import { useState } from "react";
import { PAGE_TITLE } from "./constants";

export default function DataTable(props: { data: any; loading: boolean }) {
  const { data, loading } = props;

  const [searchedText, setSearchedText] = useState("");

  const columns: TableProps<Code>["columns"] = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Link href={`./codes/${record.id}`}>{text}</Link>
      ),
      sorter: (a, b) => a.name.length - b.name.length,
      filteredValue: [searchedText],
      onFilter: (value, record) => {
        const v = value as string;
        return String(record.name).toLowerCase().includes(v);
      },
    },
    {
      title: "System Defined",
      dataIndex: "systemDefined",
      key: "systemDefined",
      render: (_, record) => {
        return <TableRowCheck check={record.systemDefined} />;
      },
    },
  ];
  return (
    <MyDataTable<Code>
      columns={columns}
      data={data}
      loading={loading}
      tableHeader={{
        setSearchedText,
        exportFileName: PAGE_TITLE,
      }}
    />
  );
}
