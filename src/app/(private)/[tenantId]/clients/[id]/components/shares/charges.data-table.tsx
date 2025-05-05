"use client";
import { ShareAccount, ShareAccountCharge } from "@/types";
import { DeleteFilled } from "@ant-design/icons";
import type { TableProps } from "antd";
import { Table, InputNumber } from "antd";
import _ from "lodash";

export default function ChargesDataTable(props: {
  data?: ShareAccountCharge[];
  setChargesData: React.Dispatch<React.SetStateAction<ShareAccountCharge[]>>;
  setFormValues: React.Dispatch<React.SetStateAction<Partial<ShareAccount>>>;
}) {
  const { data, setChargesData, setFormValues } = props;

  const onDelete = (id: number) => {
    if (!data) return;

    // Filter out the deleted charge
    const updatedData = data.filter(
      (obj) => obj.id !== id && obj.chargeId !== id
    );

    // Update state for UI
    setChargesData(updatedData);

    // Ensure formValues.shareAccountCharges is updated
    setFormValues((prevFormValues) => ({
      ...prevFormValues,
      shareAccountCharges: updatedData.length > 0 ? updatedData : [],
    }));
  };

  const onAmountChange = (value: number | null, record: ShareAccountCharge) => {
    if (value === null) return; // Prevent setting null values

    const updatedData =
      data?.map((charge) =>
        charge.chargeId === record.chargeId
          ? { ...charge, amount: value }
          : charge
      ) || [];

    setChargesData(updatedData);

    setFormValues((prevFormValues) => ({
      ...prevFormValues,
      shareAccountCharges: updatedData, // Ensure the updated charges persist
    }));
  };

  const columns: TableProps<ShareAccountCharge>["columns"] = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (_, record) => record.charge.name,
    },
    {
      title: "Type",
      dataIndex: "chargeCalculationTypeEnum",
      key: "chargeCalculationTypeEnum",
      render: (text, record) => (
        <div className="capitalize flex justify-between">
          <div>{_.toLower(record.charge.chargeCalculationTypeEnum)}</div>
          <div>
            {record.charge.chargeCalculationTypeEnum === "FLAT"
              ? `${record.charge.currencyId}`
              : ""}
          </div>
        </div>
      ),
    },
    {
      title: `Amount`,
      dataIndex: "amount",
      key: "amount",
      render: (_, record) => (
        <InputNumber
          className="w-full text-right"
          min={0}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          value={record.amount ?? record.charge.amount}
          onChange={(value) => onAmountChange(value, record)}
        />
      ),
    },
    {
      title: "Collected On",
      dataIndex: "chargeTimeTypeEnum",
      key: "chargeTimeTypeEnum",
      render: (text, record) => (
        <span className="capitalize">
          {_.toLower(record.charge.chargeTimeTypeEnum)}
        </span>
      ),
    },
    {
      title: <span className="flex justify-end"></span>,
      dataIndex: "action",
      key: "action",
      render: (_, record) => (
        <DeleteFilled
          className="flex justify-end text-red-500 cursor-pointer"
          onClick={() => onDelete(record.id ?? record.charge.id)}
        />
      ),
    },
  ];

  return <Table columns={columns} dataSource={data} rowKey="id" />;
}
