"use client";
import PageHeader from "@/components/page-header";
import { PlusOutlined } from "@ant-design/icons";
import type { TableProps } from "antd";
import { Button, Table } from "antd";
import Link from "next/link";

const data = [
  {
    key: "1",
    name: "Clients",
    url: "clients",
  },
  {
    key: "2",
    name: "Loans",
    url: "loans",
  },
  {
    key: "3",
    name: "Savings",
    url: "accounting",
  },
  {
    key: "4",
    name: "Accounting",
    url: "accounting",
  },
  {
    key: "5",
    name: "Organisation",
    url: "organisation",
  },
];

export default function Page() {
  const columns: TableProps<{ name: string; url: string }>["columns"] = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (_, record) => <Link href={`reports/${record.url}`}>{_}</Link>,
    },
  ];

  return (
    <>
      <div className="flex justify-between">
        {" "}
        <PageHeader pageTitle="Reports" />
        <Button icon={<PlusOutlined />} href="reports/create" type="primary">
          Create
        </Button>
      </div>

      <Table columns={columns} dataSource={data} />
    </>
  );
}
