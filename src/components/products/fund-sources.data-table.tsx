"use client";
import { FundSource } from "@/types";
import { DeleteFilled } from "@ant-design/icons";
import type { TableProps } from "antd";
import { Table } from "antd";

export default function FundSourcesDataTable(props: {
  data: FundSource[];
  setFundSourcesData: (data: FundSource[]) => void;
}) {
  const { data, setFundSourcesData } = props;

  function removeObjectById<T extends { id?: unknown }>(arr: T[], id: unknown) {
    return arr.filter((obj) => obj.id !== id);
  }

  const onDelete = (id: number) => {
    const removedObject = data.find((obj) => obj.id === id);
    if (removedObject) {
      const updatedData = removeObjectById(data, id);
      setFundSourcesData(updatedData);
    }
  };

  const columns: TableProps<FundSource>["columns"] = [
    {
      title: "Payment Type",
      dataIndex: "paymentType",
      key: "paymentType",
      render: (_, record) => record.paymentType.name,
    },
    {
      title: "Fund Source",
      dataIndex: "fundSource",
      key: "fundSource",
      render: (_, record) => record.glAccount.name,
    },
    {
      title: <span className="flex justify-end"></span>,
      dataIndex: "action",
      key: "action",
      render: (_, record) => {
        return (
          <DeleteFilled
            className="flex justify-end text-red-500"
            onClick={() => record.id !== undefined && onDelete(record.id)}
          />
        );
      },
    },
  ];

  return <Table columns={columns} dataSource={data} />;
}
