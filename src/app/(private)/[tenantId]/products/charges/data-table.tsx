"use client";
import MyDataTable from "@/components/data-table";
import TableRowCheck from "@/components/table-row-check";
import TableRowStatus from "@/components/table-row-status";
import { Charge, ExtendedTableColumn } from "@/types";
import { useState } from "react";
import { PAGE_TITLE } from "./constants";

export default function DataTable(props: { data: any; loading: boolean }) {
  const { data, loading } = props;

  const [searchedText, setSearchedText] = useState("");

  const columns: ExtendedTableColumn<Charge>[] = [
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
          String(record.chargeAppliesToEnum).toLowerCase().includes(v) ||
          String(record.chargeTimeTypeEnum).toLowerCase().includes(v) ||
          String(record.chargeCalculationTypeEnum).toLowerCase().includes(v) ||
          String(record.amount).toLowerCase().includes(v) ||
          String(record.isPenalty).toLowerCase().includes(v) ||
          String(record.isActive).toLowerCase().includes(v)
        );
      },
    },
    {
      title: "Applies To",
      dataIndex: "chargeAppliesToEnum",
      key: "chargeAppliesToEnum",
      sorter: (a, b) => a.name.length - b.name.length,
      render: (text) => {
        const t = text as string;
        return <span className="capitalize">{text.toLowerCase()}</span>;
      },
    },
    {
      title: "Time",
      dataIndex: "chargeTimeTypeEnum",
      key: "chargeTimeTypeEnum",
      sorter: (a, b) => a.name.length - b.name.length,
      render: (text) => {
        const t = text as string;
        return <span className="capitalize">{text.toLowerCase()}</span>;
      },
    },
    {
      title: "Calculation",
      dataIndex: "chargeCalculationTypeEnum",
      key: "chargeCalculationTypeEnum",
      sorter: (a, b) => a.name.length - b.name.length,
      render: (text) => {
        const t = text as string;
        return <span className="capitalize">{text.toLowerCase()}</span>;
      },
    },
    {
      title: <span className="flex justify-end">Amount</span>,
      dataIndex: "amount",
      key: "amount",
      exportValue: (text, record) => text,
      render: (text, record) => {
        const t = text as number;
        return (
          <span className="flex justify-end">
            {t.toLocaleString()}{" "}
            {record.chargeCalculationTypeEnum === "FLAT"
              ? record.currencyId
              : "%"}
          </span>
        );
      },
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: "Is Penalty?",
      dataIndex: "isPenalty",
      key: "isPenalty",
      render: (_, record) => {
        return <TableRowCheck check={record.isPenalty} />;
      },
      sorter: (a, b) => {
        let ac = a.isPenalty ? "true" : "false";
        let bc = b.isPenalty ? "true" : "false";
        return ac.length - bc.length;
      },
    },
    {
      title: "Is Active?",
      dataIndex: "isActive",
      key: "isActive",
      render: (_, record) => {
        return <TableRowStatus status={record.isActive} />;
      },
      sorter: (a, b) => {
        let ac = a.isActive ? "true" : "false";
        let bc = b.isActive ? "true" : "false";
        return ac.length - bc.length;
      },
    },
  ];
  return (
    <MyDataTable<Charge>
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
