"use client";
import MyDataTable from "@/components/data-table";
import TableHeader from "@/components/table-header";
import { TaxGroup } from "@/types";
import type { TableProps } from "antd";
import { Table } from "antd";
import { useState } from "react";

export default function DataTable(props: { data: any; loading: boolean }) {
  const { data, loading } = props;
  const [searchedText, setSearchedText] = useState("");

  const columns: TableProps<TaxGroup>["columns"] = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <a>{text}</a>,
      sorter: (a, b) => a.name.length - b.name.length,
      filteredValue: [searchedText],
      onFilter: (value, record) => {
        const v = value as string;
        return String(record.name).toLowerCase().includes(v);
      },
    },
  ];

  return (
    <MyDataTable<TaxGroup>
      columns={columns}
      data={data}
      loading={loading}
      tableHeader={{ setSearchedText }}
    />
  );
}
