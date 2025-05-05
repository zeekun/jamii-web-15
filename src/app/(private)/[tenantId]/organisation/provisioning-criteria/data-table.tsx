"use client";
import { Office } from "@/types";
import type { TableProps } from "antd";
import { useState } from "react";
import MyDataTable from "@/components/data-table";
import { PAGE_TITLE } from "./constants";
export default function DataTable(props: { data: any; loading: boolean }) {
  const { data, loading } = props;
  const [searchedText, setSearchedText] = useState("");

  const columns: TableProps<Office>["columns"] = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      filteredValue: [searchedText],
      sorter: (a, b) => a.name.length - b.name.length,
      onFilter: (value, record) => {
        const v = value as string;
        return String(record.name).toLowerCase().includes(v);
      },
    },
  ];

  return (
    <MyDataTable<Office>
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
