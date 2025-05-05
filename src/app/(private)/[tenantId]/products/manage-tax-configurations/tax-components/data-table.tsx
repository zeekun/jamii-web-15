"use client";
import MyDataTable from "@/components/data-table";
import TableHeader from "@/components/table-header";
import { TaxComponent } from "@/types";
import { formattedDate } from "@/utils/dates";
import type { TableProps } from "antd";
import { Table } from "antd";
import { useState } from "react";

export default function DataTable(props: { data: any; loading: boolean }) {
  const { data, loading } = props;

  const [searchedText, setSearchedText] = useState("");

  const columns: TableProps<TaxComponent>["columns"] = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <a>{text}</a>,
      sorter: (a, b) => a.name.length - b.name.length,
      filteredValue: [searchedText],
      onFilter: (value, record) => {
        const v = value as string;
        return (
          String(record.name).toLowerCase().includes(v) ||
          String(record.percentage).toLowerCase().includes(v) ||
          String(record.startDate).toLowerCase().includes(v) ||
          String(record.creditAccount?.type.codeValue)
            .toLowerCase()
            .includes(v) ||
          String(record.creditAccount?.glCode).toLowerCase().includes(v) ||
          String(record.creditAccount?.name).toLowerCase().includes(v) ||
          String(record.debitAccount?.type.codeValue)
            .toLowerCase()
            .includes(v) ||
          String(record.debitAccount?.glCode).toLowerCase().includes(v) ||
          String(record.debitAccount?.name).toLowerCase().includes(v)
        );
      },
    },
    {
      title: <span className="flex justify-end">Percentage %</span>,
      dataIndex: "percentage",
      key: "percentage",
      render: (text) => (
        <span className="flex justify-end">{text.toFixed(2)}</span>
      ),
      sorter: (a, b) => a.percentage - b.percentage,
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "startDate",
      sorter: (a, b) => a.startDate.length - b.startDate.length,
      render: (text) => formattedDate(text),
    },
    {
      title: "Debit Account",
      dataIndex: "debitAccount",
      key: "debitAccount",
      sorter: (a, b) => {
        let ac = a.debitAccount?.type.codeValue
          ? a.debitAccount?.type.codeValue
          : "";
        let bc = b.debitAccount?.type.codeValue
          ? b.debitAccount?.type.codeValue
          : "";

        return ac.length - bc.length;
      },
      render: (_, record) => {
        return record.debitAccount
          ? `${record.debitAccount?.type.codeValue} (${record.debitAccount?.glCode}) ${record.debitAccount?.name}`
          : "";
      },
    },
    {
      title: "Credit Account",
      dataIndex: "creditAccount",
      key: "creditAccount",
      sorter: (a, b) => {
        let ac = a.creditAccount?.type.codeValue
          ? a.creditAccount?.type.codeValue
          : "";
        let bc = b.creditAccount?.type.codeValue
          ? b.creditAccount?.type.codeValue
          : "";

        return ac.length - bc.length;
      },
      render: (_, record) => {
        return record.creditAccount
          ? `${record.creditAccount?.type.codeValue} (${record.creditAccount?.glCode}) ${record.creditAccount?.name}`
          : "";
      },
    },
  ];
  return (
    <MyDataTable<TaxComponent>
      columns={columns}
      data={data}
      loading={loading}
      tableHeader={{ setSearchedText }}
    />
  );
}
