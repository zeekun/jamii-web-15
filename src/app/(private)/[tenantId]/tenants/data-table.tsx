"use client";
import { Tenant } from "@/types";
import type { TableProps } from "antd";
import { useState } from "react";
import MyDataTable from "@/components/data-table";
import { PAGE_TITLE } from "./constants";

export default function DataTable(props: { data: any; loading: boolean }) {
  const [searchedText, setSearchedText] = useState("");
  const { data, loading } = props;
  const columns: TableProps<Tenant>["columns"] = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (_, record) => record.name,
      sorter: (a, b) => a.name.length - b.name.length,
      filteredValue: [searchedText],
      onFilter: (value, record) => {
        const v = value as string;
        return (
          String(record.name).toLowerCase().includes(v) ||
          String(record.name).toLowerCase().includes(v)
        );
      },
    },
  ];

  return (
    <MyDataTable<Tenant>
      columns={columns}
      data={data}
      loading={loading}
      tableHeader={{
        setSearchedText,
        exportFileName: PAGE_TITLE,
      }}
      rowType="Tenant"
    />
  );
}
