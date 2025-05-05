"use client";
import MyDataTable from "@/components/data-table";
import { SavingsProduct } from "@/types";
import type { TableProps } from "antd";
import { useState } from "react";
import { PAGE_TITLE } from "./constants";

export default function DataTable(props: { data: any; loading: boolean }) {
  const [searchedText, setSearchedText] = useState("");
  const { data, loading } = props;

  const columns: TableProps<SavingsProduct>["columns"] = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => text,
      filteredValue: [searchedText],
      onFilter: (value, record) => {
        const v = value as string;
        return String(record.name).toLowerCase().includes(v);
      },
    },
  ];

  return (
    <MyDataTable<SavingsProduct>
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
