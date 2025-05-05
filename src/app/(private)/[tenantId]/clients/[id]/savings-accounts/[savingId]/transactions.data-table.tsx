"use client";
import { SavingsAccountTransaction } from "@/types";
import type { TableProps } from "antd";
import { useState } from "react";
import _ from "lodash";
import Link from "next/link";
import { formattedDate } from "@/utils/dates";
import { formatNumber } from "@/utils/numbers";
import MyDataTable from "@/components/data-table";
import { useParams } from "next/navigation";

export default function DataTable(props: { data: any; loading: boolean }) {
  const { tenantId, id, savingId } = useParams();
  const { data, loading } = props;

  const [searchedText, setSearchedText] = useState("");

  const columns: TableProps<SavingsAccountTransaction>["columns"] = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (_) => _,
      filteredValue: [searchedText],
      onFilter: (value, record) => {
        const v = value as string;
        return (
          String(record.id).toLowerCase().includes(v) ||
          String(formattedDate(record.transactionDate))
            .toLowerCase()
            .includes(v) ||
          String(record.transactionTypeEnum).toLowerCase().includes(v) ||
          String(record.amount).toLowerCase().includes(v) ||
          String(record.runningBalanceDerived).toLowerCase().includes(v)
        );
      },
    },

    {
      title: "Transaction Date",
      dataIndex: "transactionDate",
      key: "transactionDate",
      render: (_, record) => {
        return formattedDate(record.transactionDate);
      },
    },
    {
      title: "Transaction Type",
      dataIndex: "transactionTypeEnum",
      key: "transactionTypeEnum",
      render: (__, record) => {
        return (
          <span className="capitalize">
            {_.toLower(record.transactionTypeEnum)}
          </span>
        );
      },
    },
    {
      title: <span className="flex justify-end">Debit</span>,
      dataIndex: "amount",
      key: "amount",
      render: (_, record) => {
        return (
          <span className="flex justify-end">
            {record.transactionTypeEnum === "WITHDRAW" ||
            record.transactionTypeEnum === "WITHDRAWAL FEE" ||
            record.transactionTypeEnum === "WITHDRAW TRANSFER" ||
            record.transactionTypeEnum === "PAY CHARGE"
              ? formatNumber(record.amount, 2)
              : null}
          </span>
        );
      },
    },
    {
      title: <span className="flex justify-end">Credit</span>,
      dataIndex: "amount",
      key: "amount",
      render: (_, record) => {
        return (
          <span className="flex justify-end">
            {record.transactionTypeEnum === "DEPOSIT" ||
            record.transactionTypeEnum === "INTEREST POSTING" ||
            record.transactionTypeEnum === "WAIVE CHARGE"
              ? formatNumber(record.amount, 2)
              : null}
          </span>
        );
      },
    },
    {
      title: <span className="flex justify-end">Balance</span>,
      dataIndex: "runningBalanceDerived",
      key: "runningBalanceDerived",
      render: (_, record) => {
        return (
          <span className="flex justify-end">
            {formatNumber(record.runningBalanceDerived, 2)}
          </span>
        );
      },
    },
  ];

  const isGroupPage =
    typeof window !== "undefined" &&
    window.location.pathname.includes("groups");

  const redirectUrl = `/${tenantId}/${
    isGroupPage ? "groups" : "clients"
  }/${id}/savings-accounts/${savingId}/transactions`;

  return (
    <MyDataTable<SavingsAccountTransaction>
      columns={columns}
      data={data}
      loading={loading}
      redirectUrl={redirectUrl}
      tableHeader={{ setSearchedText }}
    />
  );
}
