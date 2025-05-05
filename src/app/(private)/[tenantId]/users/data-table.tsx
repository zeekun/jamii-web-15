"use client";
import { ExtendedTableColumn, UserTenant } from "@/types";
import { useState } from "react";
import MyDataTable from "@/components/data-table";
import { useParams } from "next/navigation";
import { formattedDate } from "@/utils/dates";
import { PAGE_TITLE } from "./constants";

export default function DataTable(props: { data: any; loading: boolean }) {
  const [searchedText, setSearchedText] = useState("");
  const { data, loading } = props;
  const { tenantId } = useParams();

  const columns: ExtendedTableColumn<UserTenant>[] = [
    {
      title: "First Name",
      dataIndex: "firstName",
      key: "firstName",
      render: (_, record) => record.user.person.firstName,
      exportValue: (_, record) => record.user.person.firstName,
      sorter: (a, b) =>
        a.user.person.firstName.length - b.user.person.firstName.length,
      filteredValue: [searchedText],
      onFilter: (value, record) => {
        const v = value as string;
        return (
          String(record.user.person.firstName).toLowerCase().includes(v) ||
          String(record.user.person.lastName).toLowerCase().includes(v) ||
          String(record.user.username).toLowerCase().includes(v) ||
          String(record.user?.offices?.[0]?.name ?? "")
            .toLowerCase()
            .includes(v)
        );
      },
    },
    {
      title: "Last Name",
      dataIndex: "lastName",
      key: "lastName",
      render: (_, record) => record.user.person.lastName,
      exportValue: (_, record) => record.user.person.lastName,
      sorter: (a, b) =>
        a.user.person.lastName.length - b.user.person.lastName.length,
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      render: (_, record) => record.user.username,
      exportValue: (_, record) => record.user.username,
      sorter: (a, b) => a.user.username.length - b.user.username.length,
    },
    {
      title: "Office",
      dataIndex: "office",
      key: "office",
      render: (_, record) => {
        const office = record?.user?.offices?.find(
          (o) => o.tenantId === Number(tenantId)
        );
        return office?.name || "Not linked";
      },
      exportValue: (_, record) => {
        const office = record?.user?.offices?.find(
          (o) => o.tenantId === Number(tenantId)
        );
        return office?.name || "Not linked";
      },
      sorter: (a, b) => {
        // Get tenant-specific office for each record
        const officeA = a.user?.offices?.find(
          (o) => o.tenantId === Number(tenantId)
        );
        const officeB = b.user?.offices?.find(
          (o) => o.tenantId === Number(tenantId)
        );

        // Compare names (case insensitive)
        const nameA = officeA?.name?.toLowerCase() || "";
        const nameB = officeB?.name?.toLowerCase() || "";

        return nameA.localeCompare(nameB);
      },
    },
    {
      title: "Last Login",
      dataIndex: "lastLogin",
      key: "lastLogin",
      exportValue: (_, record) => record.user.lastLogin,
      render: (_, record) =>
        record.user?.lastLogin
          ? formattedDate(record.user?.lastLogin, "HH:MM:s A, DD MMM YYYY")
          : "",
      sorter: (a, b) =>
        (a.user?.offices?.[0]?.name?.length ?? 0) -
        (b.user?.offices?.[0]?.name?.length ?? 0),
    },
  ];

  return (
    <MyDataTable<UserTenant>
      columns={columns}
      data={data}
      loading={loading}
      redirectUrl={`/${tenantId}/users/`}
      rowType="User"
      tableHeader={{
        setSearchedText,
        exportFileName: PAGE_TITLE,
      }}
    />
  );
}
