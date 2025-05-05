"use client";
import type { TableProps } from "antd";
import { SavingsAccount } from "@/types";
import TableRowStatus from "@/components/table-row-status";
import MyDataTable from "@/components/data-table";
import { useParams } from "next/navigation";
import { hasPermission } from "@/utils/permissions";
import { useRoles } from "@/providers/RolesProvider";
import { readSavingsAccountPermissions } from "../../savings-accounts/constants";
import AccessDenied from "@/components/access-denied";

export default function SavingsDataTable(props: {
  type: "client" | "group";
  data: any;
  loading: boolean;
}) {
  const { tenantId, id, groupId } = useParams();
  const { data, loading, type } = props;

  const {
    permissions,
    error: permissionsError,
    isPermissionsLoading,
  } = useRoles();

  const canReadSavingsAccounts = hasPermission(
    permissions,
    readSavingsAccountPermissions
  );

  const columns: TableProps<SavingsAccount>["columns"] = [
    {
      title: "Account No",
      dataIndex: "accountNo",
      key: "accountNo",
      width: 200,
      render: (text, record) => {
        let color = "bg-orange-600";
        let status = false;

        if (
          record.statusEnum === "REJECTED" ||
          record.statusEnum === "WITHDRAWN BY CLIENT" ||
          record.statusEnum === "CLOSED"
        ) {
          color = "bg-gray-600";
        } else if (record.statusEnum === "APPROVED") {
          color = "bg-blue-600";
        } else if (record.statusEnum === "ACTIVE") {
          color = "bg-green-700";
        }

        return (
          <span className="flex justify-start items-center gap-2">
            <TableRowStatus status={status} color={color} />
            <span>{text}</span>
          </span>
        );
      },
    },
    {
      title: "Saving Account",
      dataIndex: "savingAccount",
      key: "savingAccount",
      render: (text, record) => record.savingsProduct.name,
    },
  ];

  return (
    <>
      {canReadSavingsAccounts ? (
        <MyDataTable<SavingsAccount>
          columns={columns}
          redirectUrl={`/${tenantId}/${
            type === "client" ? "clients" : "groups"
          }/${type === "client" ? id : groupId}/savings-accounts`}
          data={data}
          loading={loading}
        />
      ) : (
        <AccessDenied />
      )}
    </>
  );
}
