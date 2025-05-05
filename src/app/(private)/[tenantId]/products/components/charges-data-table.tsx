"use client";
import { Charge } from "@/types";
import { formatNumber } from "@/utils/numbers";
import { DeleteFilled } from "@ant-design/icons";
import type { TableProps } from "antd";
import { Table } from "antd";
import _ from "lodash";

export default function ChargesDataTable(props: {
  data?: Charge[];
  setChargesData: React.Dispatch<React.SetStateAction<Charge[]>>;
}) {
  const { data, setChargesData } = props;

  function removeObjectById(arr: any[], id: any) {
    return arr.filter((obj) => obj.id !== id);
  }

  const onDelete = (id: number) => {
    const removedObject = data?.find((obj: any) => obj.id === id);
    if (removedObject && data) {
      const updatedData = removeObjectById(data, id);
      setChargesData(updatedData);
    }
  };

  const columns: TableProps<Charge>["columns"] = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (_, record) => record.name,
    },
    {
      title: "Type",
      dataIndex: "chargeCalculationTypeEnum",
      key: "chargeCalculationTypeEnum",
      render: (__, record) => (
        <span className="capitalize">
          {_.toLower(record.chargeCalculationTypeEnum)}
        </span>
      ),
    },
    {
      title: <span className="flex justify-end">Amount</span>,
      dataIndex: "amount",
      key: "amount",
      render: (_, record) => (
        <span className="flex justify-end">
          {formatNumber(record.amount)} {record.currencyId}
        </span>
      ),
    },
    {
      title: "Collected On",
      dataIndex: "chargeTimeTypeEnum",
      key: "chargeTimeTypeEnum",
      render: (__, record) => (
        <span className="capitalize">
          {_.lowerCase(record.chargeTimeTypeEnum)}
        </span>
      ),
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
