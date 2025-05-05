"use client";
import { InterestRateSlab } from "@/types";
import { formatNumber } from "@/utils/numbers";
import { DeleteFilled } from "@ant-design/icons";
import type { TableProps } from "antd";
import { Table } from "antd";
import _ from "lodash";

export default function InterestRateSlabDataTable(props: {
  data?: InterestRateSlab[];
  setInterestRateSlabData: React.Dispatch<
    React.SetStateAction<InterestRateSlab[]>
  >;
}) {
  const { data, setInterestRateSlabData } = props;

  function removeObjectById(arr: any[], id: any) {
    return arr.filter((obj) => obj.id !== id);
  }

  const onDelete = (id: number) => {
    const removedObject = data?.find((obj: any) => obj.id === id);
    if (removedObject && data) {
      const updatedData = removeObjectById(data, id);
      setInterestRateSlabData(updatedData);
    }
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
        <span className="flex justify-end">
          {formatNumber(record.fromPeriod)}
        </span>
      ),
    },
    {
      title: "Period To",
      dataIndex: "toPeriod",
      key: "toPeriod",
      render: (_, record) => (
        <span className="flex justify-end">
          {formatNumber(record.toPeriod)}
        </span>
      ),
    },
    {
      title: "Amount Range From",
      dataIndex: "amountRangeFrom",
      key: "amountRangeFrom",
      render: (_, record) => (
        <span className="flex justify-end">
          {formatNumber(record.amountRangeFrom)}
        </span>
      ),
    },
    {
      title: "Amount Range To",
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
        <span className="flex justify-end">
          {formatNumber(record.annualInterestRate)}
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
      title: <span className="flex justify-end"></span>,
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

  return <Table columns={columns} dataSource={data} />;
}
