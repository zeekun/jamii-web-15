"use client";
import { SavingsProduct } from "@/types";
import type { TableProps } from "antd";
import { Table } from "antd";
import Link from "next/link";

export default function DataTable(props: { data: any; loading: boolean }) {
  const columns: TableProps<SavingsProduct>["columns"] = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Link href={`recurring-deposit-products/${record.id}`}>{text}</Link>
      ),
    },
  ];

  const { data, loading } = props;
  return <Table columns={columns} dataSource={data} loading={loading} />;
}
