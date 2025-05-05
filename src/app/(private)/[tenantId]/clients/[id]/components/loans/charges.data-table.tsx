// "use client";
// import { Charge } from "@/types";
// import { formatNumber } from "@/utils/numbers";
// import { DeleteFilled } from "@ant-design/icons";
// import type { TableProps } from "antd";
// import { Table } from "antd";
// import _ from "lodash";

// export default function ChargesDataTable(props: {
//   data?: Charge[];
//   setChargesData: React.Dispatch<React.SetStateAction<Charge[]>>;
// }) {
//   const { data, setChargesData } = props;

//   function removeObjectById(arr: any[], id: any) {
//     return arr.filter((obj) => obj.id !== id);
//   }

//   const onDelete = (id: number) => {
//     const removedObject = data?.find((obj: any) => obj.id === id);
//     if (removedObject && data) {
//       const updatedData = removeObjectById(data, id);
//       setChargesData(updatedData);
//     }
//   };

//   const columns: TableProps<Charge>["columns"] = [
//     {
//       title: "Name",
//       dataIndex: "name",
//       key: "name",
//       render: (_, record) => record.name,
//     },
//     {
//       title: "Type",
//       dataIndex: "chargeCalculationTypeEnum",
//       key: "chargeCalculationTypeEnum",
//       render: (__, record) => (
//         <span className="capitalize">
//           {_.toLower(record.chargeCalculationTypeEnum)}
//         </span>
//       ),
//     },
//     {
//       title: <span className="flex justify-end">Amount</span>,
//       dataIndex: "amount",
//       key: "amount",
//       render: (_, record) => (
//         <span className="flex justify-end">
//           {formatNumber(record.amount)} {record.currencyId}
//         </span>
//       ),
//     },
//     {
//       title: "Collected On",
//       dataIndex: "chargeTimeTypeEnum",
//       key: "chargeTimeTypeEnum",
//       render: (__, record) => (
//         <span className="capitalize">
//           {_.lowerCase(record.chargeTimeTypeEnum)}
//         </span>
//       ),
//     },
//     {
//       title: <span className="flex justify-end"></span>,
//       dataIndex: "action",
//       key: "action",
//       render: (_: any, record: any) => {
//         return (
//           <DeleteFilled
//             className="flex justify-end text-red-500"
//             onClick={() => onDelete(record.id)}
//           />
//         );
//       },
//     },
//   ];

//   return <Table columns={columns} dataSource={data} />;
// }

"use client";
import { Loan, LoanCharge } from "@/types";
import { DeleteFilled } from "@ant-design/icons";
import type { TableProps } from "antd";
import { Table, InputNumber } from "antd";
import _ from "lodash";

export default function ChargesDataTable(props: {
  data?: LoanCharge[];
  setChargesData: React.Dispatch<React.SetStateAction<LoanCharge[]>>;
  setFormValues: React.Dispatch<React.SetStateAction<Partial<Loan>>>;
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

    // Ensure formValues.LoanCharges is updated
    setFormValues((prevFormValues) => ({
      ...prevFormValues,
      LoanCharges: updatedData.length > 0 ? updatedData : [],
    }));
  };

  const onAmountChange = (value: number | null, record: LoanCharge) => {
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
      LoanCharges: updatedData, // Ensure the updated charges persist
    }));
  };

  const columns: TableProps<LoanCharge>["columns"] = [
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
