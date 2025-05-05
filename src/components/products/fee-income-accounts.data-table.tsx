"use client";
import { FeeIncomeAccount } from "@/types";
import { DeleteFilled } from "@ant-design/icons";
import type { TableProps } from "antd";
import { Table } from "antd";

export default function FeeIncomeAccountsDataTable(props: {
  data: FeeIncomeAccount[];
  setFeeIncomeAccountsData: React.Dispatch<
    React.SetStateAction<FeeIncomeAccount[]>
  >;
}) {
  const { data, setFeeIncomeAccountsData } = props;

  function removeObjectById(arr: FeeIncomeAccount[], id: number) {
    return arr.filter((obj: FeeIncomeAccount) => obj.id !== id);
  }

  const onDelete = (id: number) => {
    const removedObject = data.find((obj) => obj.id === id);
    if (removedObject) {
      const updatedData = removeObjectById(data, id);
      setFeeIncomeAccountsData(updatedData);
    }
  };

  const columns: TableProps<FeeIncomeAccount>["columns"] = [
    {
      title: "Fee",
      dataIndex: "Charge",
      key: "charge",
      render: (_, record) => record.charge.name,
    },
    {
      title: "Income Account",
      dataIndex: "feeIncomeAccount",
      key: "feeIncomeAccount",
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
