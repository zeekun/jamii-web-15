"use client";
import {
  DepositAccount,
  InterestRateSlab,
  SavingsAccountInterestRateSlab,
} from "@/types";
import { formatNumber } from "@/utils/numbers";
import { DeleteFilled } from "@ant-design/icons";
import type { TableProps } from "antd";
import { Table } from "antd";
import _ from "lodash";

export default function InterestRateSlabDataTable(props: {
  data?: SavingsAccountInterestRateSlab[];
  setInterestRateSlabData: React.Dispatch<
    React.SetStateAction<SavingsAccountInterestRateSlab[]>
  >;
  setFormValues: React.Dispatch<React.SetStateAction<Partial<DepositAccount>>>;
}) {
  const { data, setInterestRateSlabData, setFormValues } = props;

  const onDelete = (id: number) => {
    if (!data) return;

    // Filter out the deleted slab
    const updatedData = data.filter((slab) => slab.id !== id);

    // Update state for UI
    setInterestRateSlabData(updatedData);

    // Update formValues
    setFormValues((prevFormValues) => {
      // Ensure charts exist and reference the first one
      const existingCharts =
        prevFormValues.savingsAccountInterestRateCharts || [];
      const updatedCharts = [...existingCharts];

      if (updatedCharts.length > 0) {
        updatedCharts[0] = {
          ...updatedCharts[0],
          savingsAccountInterestRateSlabs: updatedData,
        };
      }

      return {
        ...prevFormValues,
        savingsAccountInterestRateCharts: updatedCharts,
      };
    });
  };

  const columns: TableProps<InterestRateSlab>["columns"] = [
    {
      title: "Period Type",
      dataIndex: "periodTypeEnum",
      key: "name",
      render: (__) => <span className="capitalize">{_.toLower(__)}</span>,
    },
    {
      title: "Period From",
      dataIndex: "fromPeriod",
      key: "fromPeriod",
      render: (_, record) => (
        <span className="">{formatNumber(record.fromPeriod)}</span>
      ),
    },
    {
      title: "Period To",
      dataIndex: "toPeriod",
      key: "toPeriod",
      render: (_, record) => (
        <span className="">{formatNumber(record.toPeriod)}</span>
      ),
    },
    {
      title: <span className="flex justify-end">Amount Range From</span>,
      dataIndex: "amountRangeFrom",
      key: "amountRangeFrom",
      render: (_, record) => (
        <span className="flex justify-end">
          {formatNumber(record.amountRangeFrom)}
        </span>
      ),
    },
    {
      title: <span className="flex justify-end">Amount Range To</span>,
      dataIndex: "amountRangeTo",
      key: "amountRangeTo",
      render: (_, record) => (
        <span className="flex justify-end">
          {formatNumber(record.amountRangeTo)}
        </span>
      ),
    },
    {
      title: <span className="flex justify-end">Interest</span>,
      dataIndex: "annualInterestRate",
      key: "annualInterestRate",
      render: (_, record) => (
        <span className="flex justify-end">
          {formatNumber(record.annualInterestRate)} %
        </span>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (_, record) => _,
    },
    {
      title: <span className="flex justify-end">Actions</span>,
      dataIndex: "action",
      key: "action",
      render: (_: any, record: any) => {
        return (
          <DeleteFilled
            className="flex justify-end text-red-500"
            onClick={() => onDelete(record.id)}
          />
        );
      },
    },
  ];

  return (
    <Table
      columns={columns}
      className="border border-gray-200"
      dataSource={data?.reverse()}
      rowKey="id"
    />
  );
}
