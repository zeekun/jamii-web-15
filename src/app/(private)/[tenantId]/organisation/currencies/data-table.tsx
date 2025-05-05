"use client";
import type { TableProps } from "antd";
import { Table } from "antd";

interface DataType {
  key: string;
  name: string;
}

const columns: TableProps<DataType>["columns"] = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    render: (text) => <a>{text}</a>,
  },
];

const data: DataType[] = [];
export default function DataTable(props: { data: any; loading: boolean }) {
  const { data, loading } = props;
  return <Table columns={columns} dataSource={data} loading={loading} />;
}
