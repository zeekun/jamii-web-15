"use client";
import type { TableProps } from "antd";
import Link from "next/link";
import { Loan } from "@/types";
import { UsergroupAddOutlined, UserOutlined } from "@ant-design/icons";
import TableRowStatus from "@/components/table-row-status";
import { formatNumber } from "@/utils/numbers";
import MyDataTable from "@/components/data-table";
import { useParams } from "next/navigation";
import { hasPermission } from "@/utils/permissions";
import { useRoles } from "@/providers/RolesProvider";
import { readLoanPermissions } from "../../loan-accounts/constants";
import AccessDenied from "@/components/access-denied";

export default function LoansDataTable(props: {
  type?: "client" | "group";
  data: any;
  loading: boolean;
}) {
  const { type, data, loading } = props;
  const { tenantId, id, groupId } = useParams();

  const {
    permissions,
    error: permissionsError,
    isPermissionsLoading,
  } = useRoles();

  const canReadLoans = hasPermission(permissions, readLoanPermissions);

  const columns: TableProps<Loan>["columns"] = [
    {
      title: "Account No",
      dataIndex: "accountNo",
      key: "accountNo",
      width: 200,
      render: (text, record) => {
        let color = "bg-orange-500";
        let status = false;

        if (record.loanStatusEnum === "APPROVED") {
          color = "bg-blue-600";
        } else if (record.loanStatusEnum === "REJECTED") {
          color = "bg-black";
        } else if (record.loanStatusEnum === "ACTIVE") {
          color = "bg-green-600";
        } else if (
          record.loanStatusEnum === "OVERDUE" ||
          record.loanStatusEnum === "OVERDUE NPA"
        ) {
          color = "bg-red-600";
        }
        return (
          <span className="flex justify-start items-center gap-2">
            <TableRowStatus status={status} color={color} />
            <Link href={`${record.clientId}/loan-accounts/${record.id}`}>
              {text}
            </Link>
          </span>
        );
      },
    },
    {
      title: "Loan Product",
      dataIndex: "loanProduct",
      key: "loanProduct",
      render: (text, record) => record.loanProduct.name,
    },
    {
      title: <span className="flex justify-end">Original Loan</span>,
      dataIndex: "approvedPrincipal",
      key: "approvedPrincipal",
      render: (text, record) => {
        if (
          record.loanStatusEnum === "SUBMITTED AND AWAITING APPROVAL" ||
          record.loanStatusEnum === "APPROVED"
        ) {
          return "";
        }
        return (
          <span className="flex justify-end">
            {formatNumber(record.principalDisbursedDerived)}
          </span>
        );
      },
    },
    {
      title: <span className="flex justify-end">Loan Balance</span>,
      dataIndex: "loanProduct",
      key: "loanProduct",
      render: (text, record) => {
        if (
          record.loanStatusEnum === "SUBMITTED AND AWAITING APPROVAL" ||
          record.loanStatusEnum === "APPROVED"
        ) {
          return "";
        }
        return (
          <span className="flex justify-end">
            {formatNumber(record.totalOutstandingDerived)}
          </span>
        );
      },
    },
    {
      title: <span className="flex justify-end">Amount Paid</span>,
      dataIndex: "loanProduct",
      key: "loanProduct",
      render: (text, record) => {
        if (
          record.loanStatusEnum === "SUBMITTED AND AWAITING APPROVAL" ||
          record.loanStatusEnum === "APPROVED"
        ) {
          return "";
        }
        return (
          <span className="flex justify-end">
            {formatNumber(
              (record.principalRepaidDerived || 0) +
                (record.interestRepaidDerived || 0)
            )}
          </span>
        );
      },
    },
    {
      title: "Type",
      dataIndex: "loanTypeEnum",
      key: "loanTypeEnum",
      render: (text, record) => {
        if (record.loanTypeEnum === "INDIVIDUAL LOAN") {
          return <UserOutlined title="Individual" />;
        }
        return <UsergroupAddOutlined title="Group" />;
      },
    },
  ];

  return (
    <>
      {canReadLoans ? (
        <MyDataTable<Loan>
          columns={columns}
          data={data}
          loading={loading}
          redirectUrl={`/${tenantId}/${
            type === "client" ? "clients" : "groups"
          }/${type === "client" ? id : groupId}/loan-accounts`}
        />
      ) : (
        <AccessDenied />
      )}
    </>
  );
}
