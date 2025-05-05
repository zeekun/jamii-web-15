"use client";
import PageHeader from "@/components/page-header";
import type { TableProps } from "antd";
import { Table } from "antd";
import Link from "next/link";

const data = [
  {
    key: "1",
    name: "Balance Sheet",
    url: "balance-sheet",
  },
  {
    key: "2",
    name: "Income Statement",
    url: "income-statement",
  },
  {
    key: "3",
    name: "Trial Balance",
    url: "trial-balance",
  },
  {
    key: "4",
    name: "Cash Flow Statement",
    url: "cash-flow-statement",
  },
];

export default function Page() {
  const columns: TableProps<{ name: string; url: string }>["columns"] = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (_, record) => <Link href={`accounting/${record.url}`}>{_}</Link>,
    },
  ];

  return (
    <>
      <PageHeader pageTitle={"Accounting Reports"} />
      <Table columns={columns} dataSource={data} />
    </>
  );
}
