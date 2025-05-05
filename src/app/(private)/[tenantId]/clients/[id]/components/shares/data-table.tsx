"use client";
import type { TableProps } from "antd";
import Link from "next/link";
import { ShareAccount } from "@/types";
import TableRowStatus from "@/components/table-row-status";
import { formatNumber } from "@/utils/numbers";
import MyDataTable from "@/components/data-table";
import { useParams } from "next/navigation";

export default function ShareDataTable(props: {
  type?: "client" | "group";
  data: any;
  loading: boolean;
}) {
  const { tenantId, id, groupId } = useParams();
  const { data, loading, type } = props;
  const columns: TableProps<ShareAccount>["columns"] = [
    {
      title: "Account No",
      dataIndex: "accountNo",
      key: "accountNo",
      width: 200,
      render: (text, record) => {
        let color = "bg-orange-500";
        let status = false;

        if (record.statusEnum === "APPROVED") {
          color = "bg-blue-600";
        } else if (
          record.statusEnum === "REJECTED" ||
          record.statusEnum === "CLOSED"
        ) {
          color = "bg-gray-700";
        } else if (record.statusEnum === "ACTIVE") {
          color = "bg-green-700";
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
    {
      title: "Approved Shares",
      dataIndex: "totalApprovedShares",
      key: "totalApprovedShares",
      render: (text, record) => formatNumber(record.totalApprovedShares),
    },
    {
      title: "Pending For Approval Shares",
      dataIndex: "totalPendingShares",
      key: "totalPendingShares",
      render: (text, record) => formatNumber(record.totalPendingShares),
    },
  ];

  return (
    <MyDataTable<ShareAccount>
      columns={columns}
      redirectUrl={`/${tenantId}/${type === "client" ? "clients" : "groups"}/${
        type === "client" ? id : groupId
      }/share-accounts`}
      data={data}
      loading={loading}
    />
  );
}
