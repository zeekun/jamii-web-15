"use client";
import MyDataTable from "@/components/data-table";
import { StretchyReport } from "@/types";
import type { TableProps } from "antd";
import Link from "next/link";
import { PAGE_TITLE } from "./constants";
import { useState } from "react";

export default function DataTable(props: { data: any; loading: boolean }) {
  const [searchedText, setSearchedText] = useState("");
  const { data, loading } = props;

  const columns: TableProps<StretchyReport>["columns"] = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Link href={`./roles/${record.name}`}>{text}</Link>
      ),
      filteredValue: [searchedText],
      onFilter: (value, record) => {
        const v = value as string;
        return (
          String(record.name).toLowerCase().includes(v) ||
          String(record.description).toLowerCase().includes(v)
        );
      },
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text) => <a>{text}</a>,
    },
  ];

  return (
    <MyDataTable<StretchyReport>
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
