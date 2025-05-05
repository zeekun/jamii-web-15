"use client";
import TableHeader from "@/components/table-header";
import { AccountingRule } from "@/types";
import type { TableProps } from "antd";
import { Table, Tag } from "antd";
import { useState } from "react";

export default function DataTable(props: { data: any; loading: boolean }) {
  const { data, loading } = props;

  const [searchedText, setSearchedText] = useState("");

  const columns: TableProps<AccountingRule>["columns"] = [
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
          String(record.office.name).toLowerCase().includes(v) ||
          String(record.debitAccount?.name).toLowerCase().includes(v) ||
          String(record.creditAccount?.name).toLowerCase().includes(v)
        );
      },
    },
    {
      title: "Office",
      dataIndex: "office",
      key: "office",
      render: (_, record) => record.office.name,
      sorter: (a, b) => a.office.name.length - b.office.name.length,
    },
    {
      title: "Debit Tags",
      dataIndex: "debitTags",
      key: "debitTags",
      render: (_, record) => {
        const debitTagsArray = record.accountingRuleTags;
        return (
          <>
            {debitTagsArray?.map((debitTag, index) =>
              debitTag.tag?.code.name === "accounting-rule-debit-tag" ? (
                <Tag color="red" key={index}>
                  {debitTag.tag.codeValue}
                </Tag>
              ) : null
            )}
          </>
        );
      },
    },
    {
      title: "Debit Account",
      dataIndex: "debitAccount",
      key: "debitAccount",
      render: (_, record) => record.debitAccount?.name,
      sorter: (a, b) => {
        const ac = a.debitAccount?.name ? a.debitAccount?.name : "";
        const bc = b.debitAccount?.name ? b.debitAccount?.name : "";

        return ac.length - bc.length;
      },
    },
    {
      title: "Credit Tags",
      dataIndex: "creditTags",
      key: "creditTags",
      render: (_, record) => {
        const creditTagsArray = record.accountingRuleTags;
        return (
          <>
            {creditTagsArray?.map((creditTag, index) =>
              creditTag.tag?.code.name === "accounting-rule-credit-tag" ? (
                <Tag color="green" key={index}>
                  {creditTag.tag.codeValue}
                </Tag>
              ) : null
            )}
          </>
        );
      },
    },
    {
      title: "Credit Account",
      dataIndex: "creditAccount",
      key: "creditAccount",
      render: (_, record) => record.creditAccount?.name,
    },
  ];

  return (
    <>
      <TableHeader setSearchedText={setSearchedText} />
      <Table columns={columns} dataSource={data} loading={loading} />
    </>
  );
}
