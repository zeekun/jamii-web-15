"use client";
import MyDataTable from "@/components/data-table";
import TableRowStatus from "@/components/table-row-status";
import { ExtendedTableColumn, Teller } from "@/types";
import { formattedDate } from "@/utils/dates";
import type { TableProps } from "antd";
import { useState } from "react";
import { PAGE_TITLE } from "./constants";

export default function DataTable(props: { data: Teller[]; loading: boolean }) {
  const { data, loading } = props;
  const [searchedText, setSearchedText] = useState("");

  const columns: ExtendedTableColumn<Teller>[] = [
    {
      title: "Office",
      dataIndex: "officeId",
      key: "officeId",
      exportValue: (_, record) => record.office.name,
      render: (_, record) => record.office.name,
      filteredValue: [searchedText],
      onFilter: (value, record) => {
        const v = value as string;
        return (
          String(record.name).toLowerCase().includes(v) ||
          String(record.office.name).toLowerCase().includes(v) ||
          String(record.validFrom).toLowerCase().includes(v) ||
          String(record.validTo).toLowerCase().includes(v) ||
          String(record.description).toLowerCase().includes(v)
        );
      },
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (_, record) => _,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (_, record) => <TableRowStatus status={_} />,
    },
    {
      title: "Start Date",
      dataIndex: "validFrom",
      key: "validFrom",
      render: (_, record) => formattedDate(_),
    },
    {
      title: "End Date",
      dataIndex: "validTo",
      key: "validTo",
      render: (_, record) => (record.validTo ? formattedDate(_) : ""),
    },
  ];

  return (
    <MyDataTable<Teller>
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
