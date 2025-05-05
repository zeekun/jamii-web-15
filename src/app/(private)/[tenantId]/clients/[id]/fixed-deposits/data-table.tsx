"use client";
import type { TableProps } from "antd";
import { Table } from "antd";
import Link from "next/link";
import { ShareAccount } from "@/types";
import TableRowStatus from "@/components/table-row-status";

export default function ShareDataTable(props: { data: any; loading: boolean }) {
  const { data, loading } = props;

  const columns: TableProps<ShareAccount>["columns"] = [
    {
      title: "Account No",
      dataIndex: "accountNo",
      key: "accountNo",
      render: (text, record) => {
        let color = "bg-orange-500";
        let status = false;

        if (record.statusEnum === "ACTIVE") {
          color = "bg-blue-600";
        }
        return (
          <span className="flex justify-start items-center gap-2">
            <TableRowStatus status={status} color={color} />
            <Link href={`${record.clientId}/share-accounts/${record.id}`}>
              {text}
            </Link>
          </span>
        );
      },
    },
    {
      title: "Share Product",
      dataIndex: "shareProduct",
      key: "shareProduct",
      render: (text, record) => record.shareProduct.name,
    },
  ];

  return <Table columns={columns} dataSource={data} loading={loading} />;
}
