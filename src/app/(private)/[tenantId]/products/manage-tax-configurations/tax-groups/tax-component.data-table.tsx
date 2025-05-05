"use client";
import { TaxComponent } from "@/types";
import { formattedDate } from "@/utils/dates";
import { DeleteFilled } from "@ant-design/icons";
import type { TableProps } from "antd";
import { Table } from "antd";

export default function TaxComponentDataTable(props: {
  data: any;
  setTaxComponentData: any;
  filteredTaxComponentsOptions: any[];
  setFilteredTaxComponentsOptions: any;
  loading: boolean;
}) {
  const {
    data,
    loading,
    setTaxComponentData,
    filteredTaxComponentsOptions,
    setFilteredTaxComponentsOptions,
  } = props;

  function removeObjectById(arr: any[], id: any) {
    return arr.filter((obj) => obj.id !== id);
  }

  const onDelete = (id: number) => {
    const removedObject = data.find((obj: any) => obj.id === id);
    if (removedObject) {
      const updatedData = removeObjectById(data, id);
      setTaxComponentData(updatedData);

      const newOption = { value: removedObject.id, label: removedObject.name };
      setFilteredTaxComponentsOptions([
        ...filteredTaxComponentsOptions,
        newOption,
      ]);
    }
  };

  const columns: TableProps<TaxComponent>["columns"] = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "startDate",
      render: (text) => <a>{formattedDate(text)}</a>,
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

  return <Table columns={columns} dataSource={data} loading={loading} />;
}
