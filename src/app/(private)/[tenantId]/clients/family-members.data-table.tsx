"use client";
import { FamilyMember } from "@/types";
import { formatNumber } from "@/utils/numbers";
import { DeleteFilled } from "@ant-design/icons";
import type { TableProps } from "antd";
import { Table } from "antd";
import _ from "lodash";

export default function FamilyMembersDataTable(props: {
  data?: FamilyMember[];
  setFamilyMembersData: React.Dispatch<React.SetStateAction<FamilyMember[]>>;
}) {
  const { data, setFamilyMembersData } = props;

  function removeObjectById(arr: any[], id: any) {
    return arr.filter(
      (obj: FamilyMember) =>
        `${obj.firstName}${obj.middleName}${obj.lastName}` !== id
    );
  }

  const onDelete = (id: string) => {
    const removedObject = data?.find(
      (obj: FamilyMember) =>
        `${obj.firstName}${obj.middleName}${obj.lastName}` === id
    );
    if (removedObject && data) {
      const updatedData = removeObjectById(data, id);
      setFamilyMembersData(updatedData);
    }
  };

  const columns: TableProps<FamilyMember>["columns"] = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (_, record) => `${record.firstName} ${record.lastName}`,
    },
    {
      title: <span className="flex justify-end"></span>,
      dataIndex: "action",
      key: "action",
      render: (_, record) => {
        return (
          <DeleteFilled
            className="flex justify-end text-red-500"
            onClick={() =>
              onDelete(
                `${record.firstName}${record.middleName}${record.lastName}`
              )
            }
          />
        );
      },
    },
  ];

  return <Table columns={columns} dataSource={data} />;
}
