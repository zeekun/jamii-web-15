"use client";
import { StretchyReport } from "@/types";
import type { TableProps } from "antd";
import { useState } from "react";
import MyDataTable from "@/components/data-table";
import { useParams } from "next/navigation";

export default function DataTable(props: { data: any; loading: boolean }) {
  const [searchedText, setSearchedText] = useState("");
  const { category } = useParams();
  const { data, loading } = props;
  const columns: TableProps<StretchyReport>["columns"] = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (_, record) => record.name,
      sorter: (a, b) => a.name.length - b.name.length,
      filteredValue: [searchedText],
      onFilter: (value, record) => {
        const v = value as string;
        return String(record.name).toLowerCase().includes(v);
      },
    },
  ];

  return (
    <MyDataTable<StretchyReport>
      columns={columns}
      data={data}
      loading={loading}
      tableHeader={{
        setSearchedText,
        exportFileName: `${category} Reports`,
      }}
    />
  );
}
