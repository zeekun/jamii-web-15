"use client";
import MyDataTable from "@/components/data-table";
import { ShareProduct } from "@/types";
import type { TableProps } from "antd";
import { PAGE_TITLE } from "./constants";
import { useState } from "react";

export default function DataTable(props: { data: any; loading: boolean }) {
  const [searchedText, setSearchedText] = useState("");
  const columns: TableProps<ShareProduct>["columns"] = [
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

  const { data, loading } = props;
  return (
    <MyDataTable<ShareProduct>
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
