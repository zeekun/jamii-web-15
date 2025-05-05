"use client";
import MyDataTable from "@/components/data-table";
import TableRowStatus from "@/components/table-row-status";
import { CashierTransaction, Teller } from "@/types";
import { formattedDate } from "@/utils/dates";
import { formatNumber } from "@/utils/numbers";
import type { TableProps } from "antd";
import { useState } from "react";

export default function TransactionsDataTable(props: {
  data: CashierTransaction[];
  loading: boolean;
}) {
  const { data, loading } = props;
  const [searchedText, setSearchedText] = useState("");

  const columns: TableProps<CashierTransaction>["columns"] = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (_, record) => formattedDate(_),
      filteredValue: [searchedText],
      onFilter: (value, record) => {
        const v = value as string;
        return (
          String(record.date).toLowerCase().includes(v) ||
          String(record.typeEnum).toLowerCase().includes(v) ||
          String(record.amount).toLowerCase().includes(v)
        );
      },
    },
    {
      title: "Transactions",
      dataIndex: "typeEnum",
      key: "typeEnum",
      render: (_, record) => _,
    },
    {
      title: <span className="flex justify-end">Allocation</span>,
      dataIndex: "amount",
      key: "allocationAmount",
      render: (_, record) =>
        record.typeEnum === "ALLOCATE CASH" ? (
          <span className="flex justify-end">{formatNumber(_)}</span>
        ) : null,
    },
    {
      title: "Cash In",
      dataIndex: "amount",
      key: "cashInAmount",
      render: (_, record) => null,
    },
    {
      title: "Cash Out",
      dataIndex: "amount",
      key: "cashOutAmount",
      render: (_, record) => null,
    },
    {
      title: <span className="flex justify-end">Settlement</span>,
      dataIndex: "amount",
      key: "settlementAmount",
      render: (_, record) =>
        record.typeEnum === "SETTLE CASH" ? (
          <span className="flex justify-end">{formatNumber(_)}</span>
        ) : null,
    },
  ];

  return (
    <MyDataTable<CashierTransaction>
      columns={columns}
      data={data}
      loading={loading}
      tableHeader={{ setSearchedText }}
      clickRow={false}
    />
  );
}
