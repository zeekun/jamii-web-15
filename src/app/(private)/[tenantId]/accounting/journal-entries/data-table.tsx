"use client";
import MyDataTable from "@/components/data-table";
import { ExtendedTableColumn, GlJournalEntry } from "@/types";
import { formattedDate } from "@/utils/dates";
import { formatNumber } from "@/utils/numbers";
import { useParams } from "next/navigation";
import { PAGE_TITLE } from "./constants";
import { useState } from "react";

export default function DataTable(props: {
  data: any;
  loading: boolean;
  transaction?: boolean;
}) {
  const { tenantId } = useParams();
  const { data, loading } = props;
  const [searchedText, setSearchedText] = useState("");

  let columns: ExtendedTableColumn<GlJournalEntry>[] = [
    {
      title: "Entry Id",
      dataIndex: "id",
      key: "id",
      render: (text) => text,
    },
    {
      title: "Office",
      dataIndex: "office",
      key: "office",
      exportValue: (_, record) => record.office?.name,
      render: (_, record) => record.office?.name,
    },
    {
      title: "Transaction Date",
      dataIndex: "entryDate",
      key: "entryDate",
      render: (_, record) => formattedDate(record.entryDate),
    },
    {
      title: "Transaction ID",
      dataIndex: "transactionId",
      key: "transactionId",
      render: (_, record) => record.transactionId,
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      exportValue: (_, record) => record.glAccount.type.codeValue,
      render: (_, record) => record.glAccount.type.codeValue,
    },
    // {
    //   title: "Created By",
    //   dataIndex: "createdBy",
    //   key: "createdBy",
    //   render: (_, record) => {
    //     const user = `${record.createdByUser.person.firstName} ${
    //       record.createdByUser.person.middleName ?? ""
    //     } ${record.createdByUser.person.lastName}`;
    //     return user;
    //   },
    // },
    {
      title: "Account",
      dataIndex: "account",
      key: "account",
      exportValue: (_, record) =>
        `${record.glAccount.name} (${record.glAccount.glCode})`,
      render: (_, record) => {
        return `${record.glAccount.name} (${record.glAccount.glCode})`;
      },
    },
    {
      title: <span className="flex justify-end">Debit</span>,
      dataIndex: "debitAmount",
      key: "debitAmount",
      exportValue: (_, record) => {
        const amount =
          record.typeEnum === "DEBIT" ? `${formatNumber(record.amount)}` : null;
        return `${amount}`;
      },
      render: (_, record) => {
        const amount =
          record.typeEnum === "DEBIT" ? `${formatNumber(record.amount)}` : null;
        return <span className="flex justify-end">{amount}</span>;
      },
    },
    {
      title: <span className="flex justify-end">Credit</span>,
      dataIndex: "creditAmount",
      key: "creditAmount",
      render: (_, record) => {
        const amount =
          record.typeEnum === "CREDIT"
            ? `${formatNumber(record.amount)}`
            : null;
        return <span className="flex justify-end">{amount}</span>;
      },
    },
  ];

  return (
    <>
      <MyDataTable<GlJournalEntry>
        columns={columns}
        data={data}
        rowType="JournalEntry"
        redirectUrl={`/${tenantId}/accounting/journal-entries`}
        loading={loading}
        tableHeader={{
          setSearchedText,
          exportFileName: PAGE_TITLE,
        }}
      />
    </>
  );
}
