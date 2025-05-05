"use client";
import { useGet } from "@/api";
import Alert_ from "@/components/alert";
import CreateModal from "@/components/create.modal";
import TableHeader from "@/components/table-header";
import { FamilyMember, User } from "@/types";
import type { TableProps } from "antd";
import { Table } from "antd";
import { useParams } from "next/navigation";
import { useState } from "react";
import FamilyMemberForm from "../family-member.form";

export default function FamilyMembersDataTable() {
  const { id } = useParams();

  const { data, status, error } = useGet<FamilyMember[]>(
    `clients/${id}/family-members`,
    [`clients/${id}/family-members`]
  );

  const [searchedText, setSearchedText] = useState("");
  const columns: TableProps<FamilyMember>["columns"] = [
    {
      title: "First Name",
      dataIndex: "firstName",
      key: "firstName",
      render: (_, record) => <a>{record.firstName}</a>,
      sorter: (a, b) => a.firstName.length - b.firstName.length,
      filteredValue: [searchedText],
      onFilter: (value, record) => {
        const v = value as string;
        return (
          String(record.firstName).toLowerCase().includes(v) ||
          String(record.lastName).toLowerCase().includes(v)
        );
      },
    },
    {
      title: "Last Name",
      dataIndex: "lastName",
      key: "lastName",
      render: (_, record) => <a>{record.lastName}</a>,
      sorter: (a, b) => a.lastName.length - b.lastName.length,
    },
  ];

  return (
    <>
      <div className="flex justify-between">
        <TableHeader setSearchedText={setSearchedText} />
      </div>
      {status === "error" ? (
        <Alert_ message={"Error"} description={error} type={"error"} />
      ) : (
        <Table
          columns={columns}
          dataSource={data}
          loading={status === "pending" ? true : false}
        />
      )}
    </>
  );
}
