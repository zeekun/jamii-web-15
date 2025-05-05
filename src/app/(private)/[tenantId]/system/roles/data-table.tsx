"use client";
import TableRowStatus from "@/components/table-row-status";
import type { TableProps } from "antd";
import { ExtendedColumnType, Role } from "@/types";
import MyDataTable from "@/components/data-table";

const columns: ExtendedColumnType<Role>[] = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    render: (text, record) => text,
  },
  {
    title: "Description",
    dataIndex: "description",
    key: "description",
    render: (text) => text,
  },
  {
    title: "Status",
    dataIndex: "isDisabled",
    key: "isDisabled",
    render: (_, record) => {
      const isActive = !record.isDisabled ? true : false;
      return <TableRowStatus status={isActive} />;
    },
  },
];

export default function DataTable(props: { data: any; loading: boolean }) {
  const { data, loading } = props;

  return <MyDataTable<Role> columns={columns} data={data} loading={loading} />;
}
