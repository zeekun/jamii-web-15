"use client";
import TableHeader from "@/components/table-header";
import { LoanTransaction } from "@/types";
import type { TableProps } from "antd";
import { Table } from "antd";
import { useState } from "react";
import _ from "lodash";
import Link from "next/link";
import { formattedDate } from "@/utils/dates";
import { formatNumber } from "@/utils/numbers";
import MyDataTable from "@/components/data-table";
import { useParams } from "next/navigation";

export default function DataTable(props: { data: any; loading: boolean }) {
  const { data, loading } = props;
  const { tenantId, id, loanId } = useParams();

  const [searchedText, setSearchedText] = useState("");

  const columns: TableProps<LoanTransaction>["columns"] = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (_, record) => {
        return record.id;
      },
      sorter: (a, b) => {
        if (a.id && b.id) return a.id - b.id;
        return 1;
      },
      filteredValue: [searchedText],
      onFilter: (value, record) => {
        const v = value as string;
        return (
          String(record.id).toLowerCase().includes(v) ||
          String(record.transactionDate).toLowerCase().includes(v) ||
          String(record.amount).toLowerCase().includes(v) ||
          String(record.transactionTypeEnum).toLowerCase().includes(v) ||
          String(record.principalPortionDerived).toLowerCase().includes(v) ||
          String(record.interestPortionDerived).toLowerCase().includes(v) ||
          String(record.feeChargesPortionDerived).toLowerCase().includes(v) ||
          String(record.penaltyChargesPortionDerived)
            .toLowerCase()
            .includes(v) ||
          String(record.outstandingLoanBalanceDerived).toLowerCase().includes(v)
        );
      },
    },
    // {
    //   title: "Office",
    //   dataIndex: "office",
    //   key: "office",
    //   render: (_, record) => {
    //     return record.office.name;
    //   },
    // },
    {
      title: "Transaction Date",
      dataIndex: "transactionDate",
      key: "transactionDate",
      render: (_, record) => {
        return formattedDate(record.transactionDate);
      },
      sorter: (a, b) => {
        return a.transactionDate.length - b.transactionDate.length;
      },
    },
    {
      title: "Transaction Type",
      dataIndex: "transactionTypeEnum",
      key: "transactionTypeEnum",
      render: (__, record) => {
        return (
          <span className="capitalize">
            {_.toLower(record.transactionTypeEnum.replaceAll("_", " "))}
          </span>
        );
      },
      sorter: (a, b) => {
        return a.transactionTypeEnum.length - b.transactionTypeEnum.length;
      },
    },
    {
      title: <span className="flex justify-end">Amount</span>,
      dataIndex: "amount",
      key: "amount",
      render: (_, record) => {
        return (
          <span className="flex justify-end">
            {formatNumber(record.amount, 2)}
          </span>
        );
      },
      sorter: (a, b) => {
        return a.amount - b.amount;
      },
    },
    {
      title: <span className="flex justify-end">Principal</span>,
      dataIndex: "principalPortionDerived",
      key: "principalPortionDerived",
      render: (_, record) => {
        return (
          <span className="flex justify-end">
            {formatNumber(record.principalPortionDerived, 2)}
          </span>
        );
      },
      sorter: (a, b) => {
        return a.principalPortionDerived && b.principalPortionDerived
          ? a.principalPortionDerived - b.principalPortionDerived
          : 1;
      },
    },
    {
      title: <span className="flex justify-end">Interest</span>,
      dataIndex: "interestPortionDerived",
      key: "interestPortionDerived",
      render: (_, record) => {
        return (
          <span className="flex justify-end">
            {formatNumber(record.interestPortionDerived, 2)}
          </span>
        );
      },
      sorter: (a, b) => {
        return a.interestPortionDerived && b.interestPortionDerived
          ? a.interestPortionDerived - b.interestPortionDerived
          : 1;
      },
    },
    {
      title: <span className="flex justify-end">Fees</span>,
      dataIndex: "feeChargesPortionDerived",
      key: "feeChargesPortionDerived",
      render: (_, record) => {
        return (
          <span className="flex justify-end">
            {formatNumber(record.feeChargesPortionDerived, 2)}
          </span>
        );
      },
      sorter: (a, b) => {
        return a.feeChargesPortionDerived && b.feeChargesPortionDerived
          ? a.feeChargesPortionDerived - b.feeChargesPortionDerived
          : 1;
      },
    },
    {
      title: <span className="flex justify-end">Penalties</span>,
      dataIndex: "penaltyChargesPortionDerived",
      key: "penaltyChargesPortionDerived",
      render: (_, record) => {
        return (
          <span className="flex justify-end">
            {formatNumber(record.penaltyChargesPortionDerived, 2)}
          </span>
        );
      },
      sorter: (a, b) => {
        return a.penaltyChargesPortionDerived && b.penaltyChargesPortionDerived
          ? a.penaltyChargesPortionDerived - b.penaltyChargesPortionDerived
          : 1;
      },
    },
    {
      title: <span className="flex justify-end">Loan Balance</span>,
      dataIndex: "outstandingLoanBalanceDerived",
      key: "outstandingLoanBalanceDerived",
      render: (_, record) => {
        return (
          <span className="flex justify-end">
            {formatNumber(record.outstandingLoanBalanceDerived)}
          </span>
        );
      },
      sorter: (a, b) => {
        return a.outstandingLoanBalanceDerived &&
          b.outstandingLoanBalanceDerived
          ? a.outstandingLoanBalanceDerived - b.outstandingLoanBalanceDerived
          : 1;
      },
    },
  ];
  return (
    <MyDataTable<LoanTransaction>
      columns={columns}
      data={data}
      loading={loading}
      redirectUrl={`/${tenantId}/clients/${id}/loan-accounts/${loanId}/transactions`}
      tableHeader={{ setSearchedText }}
    />
  );
}
