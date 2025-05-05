"use client";
import {
  ExtendedTableColumn,
  SavingsAccountCharge,
  SavingsAccountTransaction,
} from "@/types";
import type { TableProps } from "antd";
import { useState } from "react";
import _ from "lodash";
import Link from "next/link";
import { formattedDate } from "@/utils/dates";
import { formatNumber } from "@/utils/numbers";
import MyDataTable from "@/components/data-table";
import { useParams } from "next/navigation";
import PageHeader from "@/components/page-header";
import CreateModal from "@/components/create.modal";
import CreateForm from "./add-charge.form";
import { CheckOutlined } from "@ant-design/icons";

export default function DataTable(props: { data: any; loading: boolean }) {
  const { tenantId, id, savingId } = useParams();
  const { data, loading } = props;

  const [searchedText, setSearchedText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const columns: ExtendedTableColumn<SavingsAccountCharge>[] = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (_, record) => record.charge.name,
      filteredValue: [searchedText],
      onFilter: (value, record) => {
        const v = value as string;
        return String(record.id).toLowerCase().includes(v);
        // ||
        // String(formattedDate(record.transactionDate))
        //   .toLowerCase()
        //   .includes(v) ||
        // String(record.transactionTypeEnum).toLowerCase().includes(v) ||
        // String(record.amount).toLowerCase().includes(v) ||
        // String(record.runningBalanceDerived).toLowerCase().includes(v)
      },
    },
    {
      title: "Fee / Penalty",
      dataIndex: "charge.isPenalty",
      key: "charge.isPenalty",
      render: (_, record) => {
        return record.charge.isPenalty ? "Penalty" : "Fee";
      },
    },
    {
      title: "Payment Due At",
      dataIndex: "charge.chargeTimeTypeEnum;",
      key: "charge.chargeTimeTypeEnum;",
      render: (__, record) => {
        return (
          <span className="capitalize">{_.toLower(record.chargeTimeEnum)}</span>
        );
      },
    },
    {
      title: "Due As Of",
      dataIndex: "chargeDueDate;",
      key: "chargeDueDate;",
      render: (_, record) => {
        return record.chargeDueDate ? formattedDate(record.chargeDueDate) : "";
      },
    },
    {
      title: "Repeats On",
      dataIndex: "chargeTimeEnum;",
      key: "chargeTimeEnum;",
      render: (__, record) => {
        return <span className="capitalize"></span>;
      },
    },
    {
      title: "Calculation Type",
      dataIndex: "chargeCalculationEnum;",
      key: "chargeCalculationEnum;",
      render: (__, record) => {
        return (
          <span className="capitalize">
            {_.toLower(record.chargeCalculationEnum)}
          </span>
        );
      },
    },
    {
      title: <span className="flex justify-end">Due</span>,
      dataIndex: "charge.amount;",
      key: "charge.amount;",
      render: (_, record) => {
        return (
          <span className="flex justify-end">
            {record.chargeCalculationEnum === "FLAT" &&
              record.charge.currencyId}{" "}
            {formatNumber(record.amount, 2)}
            {record.chargeCalculationEnum !== "FLAT" && `%`}
          </span>
        );
      },
    },
    {
      title: <span className="flex justify-end">Paid</span>,
      dataIndex: "amountPaidDerived;",
      key: "amountPaidDerived;",
      render: (_, record) => {
        return (
          <span className="flex justify-end">
            {record.chargeCalculationEnum === "FLAT" &&
              record.charge.currencyId}{" "}
            {formatNumber(record.amountPaidDerived, 2)}
            {record.chargeCalculationEnum !== "FLAT" && `%`}
          </span>
        );
      },
    },
    {
      title: <span className="flex justify-end">Waived</span>,
      dataIndex: "amountWaivedDerived;",
      key: "amountWaivedDerived;",
      render: (_, record) => {
        return (
          <span className="flex justify-end">
            {record.chargeCalculationEnum === "FLAT" &&
              record.charge.currencyId}{" "}
            {formatNumber(record.amountWaivedDerived, 2)}
            {record.chargeCalculationEnum !== "FLAT" && `%`}
          </span>
        );
      },
    },
    {
      title: <span className="flex justify-end">Outstanding</span>,
      dataIndex: "amountOutstandingDerived;",
      key: "amountOutstandingDerived;",
      render: (_, record) => {
        return (
          <span className="flex justify-end">
            {record.chargeCalculationEnum === "FLAT" &&
              record.charge.currencyId}{" "}
            {formatNumber(record.amountOutstandingDerived, 2)}
            {record.chargeCalculationEnum !== "FLAT" && `%`}
          </span>
        );
      },
    },
  ];
  return (
    <>
      <PageHeader
        pageTitle={"Charges"}
        createModal={
          <CreateModal
            pageTitle={"Charge"}
            buttonTitle="Add Charge"
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            submitType="create"
            CreateForm={<CreateForm setIsModalOpen={setIsModalOpen} />}
          />
        }
      />
      <MyDataTable<SavingsAccountCharge>
        columns={columns}
        data={data}
        loading={loading}
        redirectUrl={`/${tenantId}/clients/${id}/savings-accounts/${savingId}/charges`}
        tableHeader={{ setSearchedText }}
      />
    </>
  );
}
