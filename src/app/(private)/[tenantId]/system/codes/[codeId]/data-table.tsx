"use client";
import MyDataTable from "@/components/data-table";
import TableRowStatus from "@/components/table-row-status";
import { CodeValue } from "@/types";
import type { TableProps } from "antd";
import { useState } from "react";
import { PAGE_TITLE } from "./constants";

export default function DataTable(props: {
  data: any;
  loading: boolean;
  actionColumns: boolean | null;
  codeId: string;
  subPageTitle: string | null;
}) {
  const { data, loading, subPageTitle } = props;
  const [searchedText, setSearchedText] = useState("");

  const columns: TableProps<CodeValue>["columns"] = [
    {
      title: "Code Value",
      dataIndex: "codeValue",
      key: "codeValue",
      render: (text) => text,
      sorter: (a, b) => a.codeValue.length - b.codeValue.length,
      filteredValue: [searchedText],
      onFilter: (value, record) => {
        const v = value as string;
        return (
          String(record.codeValue).toLowerCase().includes(v) ||
          String(record.orderPosition).toLowerCase().includes(v) ||
          String(record.codeDescription).toLowerCase().includes(v)
        );
      },
    },
    {
      title: "Order Position",
      dataIndex: "orderPosition",
      key: "orderPosition",
      sorter: (a, b) => a.orderPosition - b.orderPosition,
      render: (text) => text,
    },
    {
      title: "Description",
      dataIndex: "codeDescription",
      key: "codeDescription",
      sorter: (a, b) => {
        let ac = a.codeDescription ? a.codeDescription : "";
        let bc = b.codeDescription ? b.codeDescription : "";
        return ac.length - bc.length;
      },
      render: (text) => text,
    },
    {
      title: "Is Active",
      dataIndex: "isActive",
      key: "isActive",
      sorter: (a, b) => {
        let ac = a.isActive ? "true" : "false";
        let bc = b.isActive ? "true" : "false";
        return ac.length - bc.length;
      },
      render: (_, record) => <TableRowStatus status={record.isActive} />,
    },
  ];

  return (
    <MyDataTable<CodeValue>
      columns={columns}
      data={data}
      loading={loading}
      tableHeader={{
        setSearchedText,
        exportFileName: `${PAGE_TITLE} For ${subPageTitle}`,
      }}
    />
  );
}
