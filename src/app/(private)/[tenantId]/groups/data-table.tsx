"use client";
import TableHeader from "@/components/table-header";
import TableRowStatus from "@/components/table-row-status";
import { Group } from "@/types";
import type { TableProps } from "antd";
import { Table } from "antd";
import { useState } from "react";
import Link from "next/link";
import MyDataTable from "@/components/data-table";

export default function DataTable(props: { data: any; loading: boolean }) {
  const { data, loading } = props;

  const [searchedText, setSearchedText] = useState("");

  const columns: TableProps<Group>["columns"] = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (_, record) => {
        return record.name;
      },

      filteredValue: [searchedText],
      onFilter: (value, record) => {
        const v = value as string;
        return String(record.name).toLowerCase().includes(v);
      },
    },

    {
      title: "Account No",
      dataIndex: "accountNo",
      key: "accountNo",
      sorter: (a, b) => {
        const ac = a.accountNo ? a.accountNo : "";
        const bc = b.accountNo ? b.accountNo : "";
        return ac.length - bc.length;
      },
      render: (_, record) => {
        return <span className="capitalize">{_}</span>;
      },
    },

    {
      title: "External Id",
      dataIndex: "externalId",
      key: "externalId",
      sorter: (a, b) => {
        const ac = a.externalId ? a.externalId : "";
        const bc = b.externalId ? b.externalId : "";
        return ac.length - bc.length;
      },
      render: (_, record) => {
        return <span className="capitalize">{_}</span>;
      },
    },

    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (_, record) => {
        return (
          <TableRowStatus status={record.isActive ? record.isActive : false} />
        );
      },
      sorter: (a, b) => {
        let ac = a.isActive ? "true" : "false";
        let bc = b.isActive ? "true" : "false";
        return ac.length - bc.length;
      },
    },

    {
      title: "Office",
      dataIndex: "office",
      key: "office",
      render: (_, record) => record.office.name,
      sorter: (a, b) => a.office.name.length - b.office.name.length,
    },
  ];
  return (
    <MyDataTable<Group>
      columns={columns}
      data={data}
      loading={loading}
      tableHeader={{ setSearchedText }}
    />
  );
}
