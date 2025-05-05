"use client";
import TableRowStatus from "@/components/table-row-status";
import { FloatingRate } from "@/types";
import type { TableProps } from "antd";
import { useState } from "react";
import Link from "next/link";
import TableRowCheck from "@/components/table-row-check";
import MyDataTable from "@/components/data-table";

export default function DataTable(props: { data: any; loading: boolean }) {
  const { data, loading } = props;

  const [searchedText, setSearchedText] = useState("");

  const columns: TableProps<FloatingRate>["columns"] = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (_, record) => record.name,
      filteredValue: [searchedText],
      onFilter: (value, record) => {
        const v = value as string;
        return String(record.name).toLowerCase().includes(v);
      },
    },
    {
      title: "Is Base Lending Rate",
      dataIndex: "isBaseLendingRate",
      key: "isBaseLendingRate",
      render: (_, record) => {
        return (
          <TableRowCheck
            check={record.isBaseLendingRate ? record.isBaseLendingRate : false}
          />
        );
      },
      sorter: (a, b) => {
        let ac = a.isActive ? "true" : "false";
        let bc = b.isActive ? "true" : "false";
        return ac.length - bc.length;
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
  ];
  return (
    <>
      <MyDataTable<FloatingRate>
        columns={columns}
        data={data}
        loading={loading}
        tableHeader={{ setSearchedText }}
      />
    </>
  );
}
