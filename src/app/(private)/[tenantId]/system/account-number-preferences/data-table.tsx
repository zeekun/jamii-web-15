"use client";
import type { TableProps } from "antd";
import { Table } from "antd";
import Link from "next/link";

interface DataType {
  key: string;
  name: string;
  from_date: string;
  to_date: string;
  repayment_scheduled_to: string;
}

const columns: TableProps<DataType>["columns"] = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    render: (text, record) => (
      <Link href={`./roles/${record.name}`}>{text}</Link>
    ),
  },
  {
    title: "Description",
    dataIndex: "description",
    key: "description",
    render: (text) => <a>{text}</a>,
  },
];

const data: DataType[] = [];
export default function DataTable(props: { data: any; loading: boolean }) {
  const { data, loading } = props;
  return <Table columns={columns} dataSource={data} loading={loading} />;
}
