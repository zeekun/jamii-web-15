"use client";
import type { TableProps } from "antd";
import { Button, Modal, Table } from "antd";
import { LoanCharge } from "@/types";
import { formatNumber } from "@/utils/numbers";
import _ from "lodash";
import AddLoanChargesForm from "./add-loan-charge";
import { useState } from "react";
import { DeleteFilled, EditOutlined } from "@ant-design/icons";
import MyDataTable from "@/components/data-table";
import { useParams } from "next/navigation";

export default function DataTable(props: {
  data: LoanCharge[] | undefined;
  status: boolean;
}) {
  const { tenantId, id, loanId } = useParams();
  const { data, status } = props;

  const columns: TableProps<LoanCharge>["columns"] = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (_, record) => record.charge.name,
    },
    {
      title: "Fee/Penalty",
      dataIndex: "fee/Penalty",
      key: "fee/Penalty",
      render: (_, record) => (record.isPenalty ? "Penalty" : "Fee"),
    },
    {
      title: "Payment Due At",
      dataIndex: "chargeTimeTypeEnum",
      key: "chargeTimeTypeEnum",
      render: (__, record) => (
        <span className="capitalize">{_.toLower(record.chargeTimeEnum)}</span>
      ),
    },
    {
      title: "Due As Of",
      dataIndex: "chargeTimeTypeEnum",
      key: "chargeTimeTypeEnum",
      render: (__, record) => <span className="capitalize"></span>,
    },
    {
      title: "Calculation Type",
      dataIndex: "chargeCalculationTypeEnum",
      key: "chargeCalculationTypeEnum",
      render: (__, record) => (
        <span className="capitalize">
          {_.toLower(record.chargeCalculationEnum)}
        </span>
      ),
    },
    {
      title: <span className="flex justify-end">Due</span>,
      dataIndex: "amount",
      key: "amount",
      render: (_, record) => (
        <span className="flex justify-end">
          {formatNumber(record.amount)} {record.charge.currencyId}
        </span>
      ),
    },
    {
      title: <span className="flex justify-end">Paid</span>,
      dataIndex: "amount",
      key: "amount",
      render: (_, record) => (
        <span className="flex justify-end">
          {0} {record.charge.currencyId}
        </span>
      ),
    },
    {
      title: <span className="flex justify-end">Waived</span>,
      dataIndex: "amount",
      key: "amount",
      render: (_, record) => (
        <span className="flex justify-end">
          {0} {record.charge.currencyId}
        </span>
      ),
    },
    {
      title: <span className="flex justify-end">Outstanding</span>,
      dataIndex: "amount",
      key: "amount",
      render: (_, record) => (
        <span className="flex justify-end">
          {formatNumber(record.amountOutstandingDerived)}{" "}
          {record.charge.currencyId}
        </span>
      ),
    },
  ];

  return (
    <MyDataTable<LoanCharge>
      columns={columns}
      data={data || []}
      redirectUrl={`/${tenantId}/clients/${id}/loan-accounts/${loanId}/charges`}
      loading={status}
    />
  );
}
