"use client";
import TableHeader from "@/components/table-header";
import { ShareAccountTransaction } from "@/types";
import type { TableProps } from "antd";
import { Table } from "antd";
import { useState } from "react";
import _ from "lodash";
import { formattedDate } from "@/utils/dates";
import { formatNumber } from "@/utils/numbers";
import CreateModal from "@/components/create.modal";
import { CheckOutlined } from "@ant-design/icons";
import ApproveAdditionalShareTransactionForm from "./approve-additional-share-transaction.form";

export default function DataTable(props: { data: any; loading: boolean }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data, loading } = props;

  const [searchedText, setSearchedText] = useState("");

  const columns: TableProps<ShareAccountTransaction>["columns"] = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (_, record) => {
        return record.id;
      },
      filteredValue: [searchedText],
      onFilter: (value, record) => {
        const v = value as string;
        return String(record.id).toLowerCase().includes(v);
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
      dataIndex: "typeEnum",
      key: "typeEnum",
      render: (__, record) => {
        let status;
        if (record.typeEnum === "PURCHASE") {
          if (
            record.shareAccount.statusEnum === "SUBMITTED AND AWAITING APPROVAL"
          ) {
            status = "(Pending Approval)";
          } else if (record.shareAccount.statusEnum === "APPROVED") {
            status = "(Approved)";
          }
        }
        return (
          <span className="capitalize">
            {_.toLower(record.typeEnum)} {status}
          </span>
        );
      },
    },
    {
      title: <span className="flex justify-end">Total Shares</span>,
      dataIndex: "totalShares",
      key: "totalShares",
      render: (_, record) => {
        return (
          <span className="flex justify-end">
            {record.typeEnum === "CHARGE PAYMENT"
              ? ""
              : formatNumber(record.totalShares)}
          </span>
        );
      },
    },
    {
      title: <span className="flex justify-end">Purchased/Redeemed Price</span>,
      dataIndex: "unitPrice",
      key: "unitPrice",
      render: (_, record) => {
        return (
          <span className="flex justify-end">
            {record.typeEnum === "CHARGE PAYMENT"
              ? ""
              : formatNumber(record.unitPrice)}
          </span>
        );
      },
    },
    {
      title: <span className="flex justify-end">Charge Amount</span>,
      dataIndex: "interestPortionDerived",
      key: "interestPortionDerived",
      render: (_, record) => {
        return (
          <span className="flex justify-end">
            {record.shareAccount.currencyCode}{" "}
            {formatNumber(record.chargeAmount)}
            {}
          </span>
        );
      },
    },
    {
      title: <span className="flex justify-end">Amount Received/Returned</span>,
      dataIndex: "amount",
      key: "amount",
      render: (_, record) => {
        return (
          <span className="flex justify-end">
            {record.shareAccount.currencyCode} {formatNumber(record.amount)}
          </span>
        );
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
