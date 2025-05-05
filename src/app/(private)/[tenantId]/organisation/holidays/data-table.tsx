"use client";
import { Holiday } from "@/types";
import { formattedDate } from "@/utils/dates";
import type { TableProps } from "antd";
import { useState } from "react";
import _ from "lodash";
import MyDataTable from "@/components/data-table";
import { PAGE_TITLE } from "./constants";

export default function DataTable(props: { data: any; loading: boolean }) {
  const { data, loading } = props;

  const [searchedText, setSearchedText] = useState("");

  const columns: TableProps<Holiday>["columns"] = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (_) => _,
      filteredValue: [searchedText],
      onFilter: (value, record) => {
        const v = value as string;
        return (
          String(record.name).toLowerCase().includes(v) ||
          String(record.fromDate).toLowerCase().includes(v) ||
          String(record.toDate).toLowerCase().includes(v) ||
          String(record.repaymentScheduledTo).toLowerCase().includes(v)
        );
      },
    },
    {
      title: "From Date",
      dataIndex: "fromDate",
      key: "fromDate",
      render: (_, record) => formattedDate(record.fromDate),
    },
    {
      title: "To Date",
      dataIndex: "toDate",
      key: "toDate",
      render: (_, record) => formattedDate(record.toDate),
    },
    {
      title: "Repayment Scheduled To",
      dataIndex: "repaymentScheduledTo",
      key: "repaymentScheduledTo",
      render: (_, record) => {
        const d = record.repaymentScheduledTo
          ? formattedDate(record.repaymentScheduledTo)
          : null;
        return d;
      },
    },
    {
      title: "Recurrence Type",
      dataIndex: "recurrenceType",
      key: "recurrenceType",
      render: (__, record) => {
        const d = record.recurrenceType
          ? _.lowerCase(record.recurrenceType)
          : null;
        return <span className="capitalize">{d}</span>;
      },
    },
  ];

  return (
    <MyDataTable<Holiday>
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
