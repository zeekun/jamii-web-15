"use client";
import MyDataTable from "@/components/data-table";
import TableHeader from "@/components/table-header";
import TableRowCheck from "@/components/table-row-check";
import { PaymentType } from "@/types";
import type { TableProps } from "antd";
import { Table } from "antd";
import { useState } from "react";
import { PAGE_TITLE } from "./constants";

export default function DataTable(props: { data: any; loading: boolean }) {
  const [searchedText, setSearchedText] = useState("");

  const columns: TableProps<PaymentType>["columns"] = [
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
          String(record.description).toLowerCase().includes(v) ||
          String(record.isCashPayment).toLowerCase().includes(v) ||
          String(record.position).toLowerCase().includes(v)
        );
      },
      render: (text) => <a>{text}</a>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "Is Cash Payment",
      dataIndex: "isCashPayment",
      key: "isCashPayment",
      render: (_, record) => {
        return <TableRowCheck check={record.isCashPayment} />;
      },
    },
    {
      title: "Position",
      dataIndex: "position",
      key: "position",
      render: (text) => <a>{text}</a>,
    },
  ];
  const { data, loading } = props;
  return (
    <MyDataTable<PaymentType>
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
