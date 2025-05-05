"use client";
import { InterestRateSlab } from "@/types";
import { formatNumber } from "@/utils/numbers";
import { DeleteFilled } from "@ant-design/icons";
import type { TableProps } from "antd";
import { Table } from "antd";
import _ from "lodash";

export default function InterestRateSlabDataTable(props: {
  data?: InterestRateSlab[];
}) {
  const { data } = props;

  function removeObjectById(arr: any[], id: any) {
    return arr.filter((obj) => obj.id !== id);
  }

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
      title: "Interest",
      dataIndex: "annualInterestRate",
      key: "annualInterestRate",
      render: (_, record) => (
        <span className="">{formatNumber(record.annualInterestRate)}</span>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (_, record) => _,
    },
  ];

  return <Table columns={columns} dataSource={data} />;
}
