"use client";
import MyDataTable from "@/components/data-table";
import { SavingsProduct } from "@/types";
import type { TableProps } from "antd";
import Link from "next/link";
import { PAGE_TITLE } from "./constants";
import { useState } from "react";

export default function DataTable(props: { data: any; loading: boolean }) {
  const [searchedText, setSearchedText] = useState("");

  const columns: TableProps<SavingsProduct>["columns"] = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Link href={`fixed-deposit-products/${record.id}`}>{text}</Link>
      ),
    },
  ];

  const { data, loading } = props;
  return (
    <MyDataTable<SavingsProduct>
      columns={columns}
      data={data}
      loading={loading}
      tableHeader={{
        setSearchedText,
        exportFileName: PAGE_TITLE,
      }}
    />
  );
}
