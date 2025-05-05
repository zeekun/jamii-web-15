"use client";
import { PenaltyIncomeAccount } from "@/types";
import { DeleteFilled } from "@ant-design/icons";
import type { TableProps } from "antd";
import { Table } from "antd";

export default function PenaltyIncomeAccountsDataTable(props: {
  data: PenaltyIncomeAccount[];
  setPenaltyIncomeAccountsData: React.Dispatch<
    React.SetStateAction<PenaltyIncomeAccount[]>
  >;
}) {
  const { data, setPenaltyIncomeAccountsData } = props;

  function removeObjectById(arr: PenaltyIncomeAccount[], id: string) {
    return arr.filter((obj) => obj.id !== Number(id));
  }

  const onDelete = (id: string) => {
    const removedObject = data.find(
      (obj: PenaltyIncomeAccount) => obj.id === Number(id)
    );
    if (removedObject) {
      const updatedData = removeObjectById(data, id);
      setPenaltyIncomeAccountsData(updatedData);
    }
  };

  const columns: TableProps<PenaltyIncomeAccount>["columns"] = [
    {
      title: "Penalty",
      dataIndex: "charge",
      key: "charge",
      render: (_, record) => record.charge.name,
    },
    {
      title: "Income Account",
      dataIndex: "penaltyIncomeAccount",
      key: "penaltyIncomeAccount",
      render: (_, record) => record.glAccount.name,
    },
    {
      title: <span className="flex justify-end"></span>,
      dataIndex: "action",
      key: "action",
      render: (_, record: PenaltyIncomeAccount) => {
        return (
          <DeleteFilled
            className="flex justify-end text-red-500"
            onClick={() =>
              record.id !== undefined && onDelete(record.id.toString())
            }
          />
        );
      },
    },
  ];

  return <Table columns={columns} dataSource={data} rowKey="id" />;
}
