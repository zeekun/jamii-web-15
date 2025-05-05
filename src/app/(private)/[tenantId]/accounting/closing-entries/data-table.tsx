"use client";
import TableHeader from "@/components/table-header";
import { GLClosure } from "@/types";
import { formattedDate } from "@/utils/dates";
import type { TableProps } from "antd";
import { Table } from "antd";
import { useState } from "react";

export default function DataTable(props: { data: any; loading: boolean }) {
  const { data, loading } = props;

  const [searchedText, setSearchedText] = useState("");

  const columns: TableProps<GLClosure>["columns"] = [
    {
      title: "Office",
      dataIndex: "office",
      key: "office",
      render: (_, record) => record.office.name,
      sorter: (a, b) => a.office.name.length - b.office.name.length,
      filteredValue: [searchedText],
      onFilter: (value, record) => {
        const v = value as string;
        return (
          String(record.office.name).toLowerCase().includes(v) ||
          String(record.closingDate).toLowerCase().includes(v) ||
          String(record.comments).toLowerCase().includes(v)
        );
      },
    },
    {
      title: "Closing Date",
      dataIndex: "closingDate",
      key: "closingDate",
      render: (text) => formattedDate(text),
      sorter: (a, b) => a.closingDate.length - b.closingDate.length,
    },
    {
      title: "Comments",
      dataIndex: "comments",
      key: "comments",
      render: (text) => text,
      sorter: (a, b) => {
        let ac = "";
        let bc = "";
        if (a.comments) {
          ac = a.comments;
        }
        if (b.comments) {
          bc = b.comments;
        }
        return ac.length - bc.length;
      },
    },
  ];
  return (
    <>
      <TableHeader setSearchedText={setSearchedText} />
      <Table columns={columns} dataSource={data} loading={loading} />
    </>
  );
}
