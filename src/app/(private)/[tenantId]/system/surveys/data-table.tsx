"use client";
import { formattedDate } from "@/utils/dates";
import type { TableProps } from "antd";
import { Table } from "antd";

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
    render: (text) => <a>{text}</a>,
  },
  {
    title: "From Date",
    dataIndex: "from_date",
    key: "from_date",
    render: (text) => <a>{formattedDate(text)}</a>,
  },
  {
    title: "To Date",
    dataIndex: "to_date",
    key: "to_date",
    render: (text) => <a>{formattedDate(text)}</a>,
  },
];

const data: DataType[] = [];
export default function DataTable(props: { data: any; loading: boolean }) {
  const { data, loading } = props;
  return <Table columns={columns} dataSource={data} loading={loading} />;
}
