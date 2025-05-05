"use client";
import MyDataTable from "@/components/data-table";
import { ExtendedColumnType, Job } from "@/types";
import type { TableProps } from "antd";

const columns: ExtendedColumnType<Job>[] = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    render: (text, record) => text,
  },
  {
    title: "Next Run",
    dataIndex: "nextRunTime",
    key: "nextRunTime",
    render: (text) => text,
  },
  {
    title: "Previous Run",
    dataIndex: "previousRunStartTime",
    key: "nextRunTime",
    render: (text) => text,
  },
  {
    title: "Previous Run Status",
    dataIndex: "isMisfired",
    key: "isMisfired",
    render: (_, record) => (record.isMisfired ? "Failed" : "Success"),
  },
];

// rowSelection object indicates the need for row selection
const rowSelection: TableProps<Job>["rowSelection"] = {
  onChange: (selectedRowKeys: React.Key[], selectedRows: Job[]) => {
    console.log(
      `selectedRowKeys: ${selectedRowKeys}`,
      "selectedRows: ",
      selectedRows
    );
  },
  getCheckboxProps: (record: Job) => ({
    disabled: record.name === "Disabled User", // Column configuration not to be checked
    name: record.name,
  }),
};

export default function DataTable(props: { data: any; loading: boolean }) {
  const { data, loading } = props;

  return (
    <MyDataTable<Job>
      columns={columns}
      data={data}
      rowSelection={rowSelection}
      loading={loading}
    />
  );
}
