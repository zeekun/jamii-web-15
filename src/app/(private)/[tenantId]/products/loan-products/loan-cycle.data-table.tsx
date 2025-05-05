"use client";
import { LoanCycle, LoanCycleParamTypeEnum, LoanProduct } from "@/types";
import { formatNumber } from "@/utils/numbers";
import { DeleteFilled } from "@ant-design/icons";
import type { TableProps } from "antd";
import { Table } from "antd";
import { SetStateAction } from "react";

export default function LoanCycleDataTable(props: {
  data: LoanCycle[];
  type: LoanCycleParamTypeEnum;
  setLoanCyclesPrincipalData?: React.Dispatch<
    React.SetStateAction<LoanCycle[]>
  >;
  setLoanCyclesNumberOfRepaymentsData?: React.Dispatch<
    React.SetStateAction<LoanCycle[]>
  >;
  setLoanCyclesNominalInterestRatesData?: React.Dispatch<
    React.SetStateAction<LoanCycle[]>
  >;
  formValues: Partial<LoanProduct>;
  setFormValues: React.Dispatch<SetStateAction<Partial<LoanProduct>>>;
}) {
  const {
    data,
    type,
    setLoanCyclesPrincipalData,
    setLoanCyclesNumberOfRepaymentsData,
    setLoanCyclesNominalInterestRatesData,
    formValues,
    setFormValues,
  } = props;

  const onDelete = (id: string) => {
    if (!data) return;

    // Find the object to be removed using a unique identifier
    const removedObject = data.find((obj: LoanCycle) => {
      return (
        `${obj.borrowerCycleNumber}${obj.defaultValue}${obj.maxValue}${obj.minValue}${obj.paramTypeEnum}${obj.valueConditionTypeEnum}` ===
        id
      );
    });

    if (removedObject) {
      // Create updated data by filtering out the removed object
      const updatedData = data.filter((obj) => obj !== removedObject);

      // Update the specific state based on the type
      if (type === "PRINCIPAL" && setLoanCyclesPrincipalData) {
        setLoanCyclesPrincipalData(updatedData);
      } else if (
        type === "NUMBER OF REPAYMENTS" &&
        setLoanCyclesNumberOfRepaymentsData
      ) {
        setLoanCyclesNumberOfRepaymentsData(updatedData);
      } else if (
        type === "NOMINAL INTEREST RATE" &&
        setLoanCyclesNominalInterestRatesData
      ) {
        setLoanCyclesNominalInterestRatesData(updatedData);
      }

      // Update formValues with the modified list
      setFormValues((prevFormValues) => ({
        ...prevFormValues,
        loanProductVariationsBorrowerCycles:
          prevFormValues.loanProductVariationsBorrowerCycles?.filter(
            (cycle) =>
              `${cycle.borrowerCycleNumber}${cycle.defaultValue}${cycle.maxValue}${cycle.minValue}${cycle.paramTypeEnum}${cycle.valueConditionTypeEnum}` !==
              id
          ) || [],
      }));
    } else {
      console.warn(`No item found with ID: ${id}`);
    }
  };

  const columns: TableProps<LoanCycle>["columns"] = [
    {
      title: "Condition",
      dataIndex: "valueConditionTypeEnum",
      key: "valueConditionTypeEnum",
      render: (_, record) => (
        <span className="capitalize">
          {record.valueConditionTypeEnum.toLowerCase()}
        </span>
      ),
    },
    {
      title: <span className="flex justify-end">Loan Cycle</span>,
      dataIndex: "borrowerCycleNumber",
      key: "borrowerCycleNumber",
      render: (_, record) => (
        <span className="flex justify-end">
          {formatNumber(record.borrowerCycleNumber)}
        </span>
      ),
    },
    {
      title: <span className="flex justify-end">Minimum</span>,
      dataIndex: "minValue",
      key: "minValue",
      render: (_, record) => (
        <span className="flex justify-end">
          {formatNumber(record.minValue)}
        </span>
      ),
    },
    {
      title: <span className="flex justify-end">Default</span>,
      dataIndex: "defaultValue",
      key: "defaultValue",
      render: (_, record) => (
        <span className="flex justify-end">
          {formatNumber(record.defaultValue)}
        </span>
      ),
    },
    {
      title: <span className="flex justify-end">Maximum</span>,
      dataIndex: "maxValue",
      key: "maxValue",
      render: (_, record) => (
        <span className="flex justify-end">
          {formatNumber(record.maxValue)}
        </span>
      ),
    },
    {
      title: <span className="flex justify-end">Action</span>,
      dataIndex: "action",
      key: "action",
      render: (_: any, record: any) => {
        return (
          <DeleteFilled
            className="flex justify-end text-red-500"
            onClick={() =>
              onDelete(
                `${record.borrowerCycleNumber}${record.defaultValue}${record.maxValue}${record.minValue}${record.paramTypeEnum}${record.valueConditionTypeEnum}`
              )
            }
          />
        );
      },
    },
  ];

  // Filter data based on type
  const filteredData = data?.filter((item) => item.paramTypeEnum === type);

  return <Table columns={columns} dataSource={filteredData} />;
}
