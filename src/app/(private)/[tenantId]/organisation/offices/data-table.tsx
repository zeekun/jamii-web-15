"use client";
import { ExtendedTableColumn, Office } from "@/types";
import { formattedDate } from "@/utils/dates";
import type { TableProps } from "antd";
import { useState } from "react";
import MyDataTable from "@/components/data-table";
import { PAGE_TITLE } from "./constants";
export default function DataTable(props: { data: any; loading: boolean }) {
  const { data, loading } = props;
  const [searchedText, setSearchedText] = useState("");

  const columns: ExtendedTableColumn<Office>[] = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      filteredValue: [searchedText],
      sorter: (a, b) => a.name.length - b.name.length,
      onFilter: (value, record) => {
        const v = value as string;
        return (
          String(record.name).toLowerCase().includes(v) ||
          String(record.openingDate).toLowerCase().includes(v) ||
          String(record.parent?.name).toLowerCase().includes(v)
        );
      },
    },
    {
      title: "Opened On",
      dataIndex: "openingDate",
      key: "openingDate",
      render: (text) => {
        return formattedDate(text);
      },
    },
    {
      title: "Parent Office",
      dataIndex: "parent",
      key: "parent",
      exportValue: (_, record) => record.parent?.name || "",
      render: (_, record) => {
        const parentName = record.parent ? record.parent.name : "";
        return parentName;
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
