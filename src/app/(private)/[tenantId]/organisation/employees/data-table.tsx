"use client";
import TableRowCheck from "@/components/table-row-check";
import TableRowStatus from "@/components/table-row-status";
import { Employee, ExtendedTableColumn } from "@/types";
import { useState } from "react";
import MyDataTable from "@/components/data-table";
import { PAGE_TITLE } from "./constants";

export default function DataTable(props: { data: any; loading: boolean }) {
  const [searchedText, setSearchedText] = useState("");
  const { data, loading } = props;

  const columns: ExtendedTableColumn<Employee>[] = [
    {
      title: "Name",
      dataIndex: "firstName",
      key: "firstName",
      render: (_, record) => {
        const middleName = record.middleName ? `${record.middleName} ` : "";
        return `${record.firstName} ${middleName}${record.lastName}`;
      },
      sorter: (a, b) => a.firstName.length - b.firstName.length,
      filteredValue: [searchedText],
      onFilter: (value, record) => {
        const v = value as string;
        let e = "";
        let n = "";
        if (record.phoneNumbers) {
          const number2 =
            record.phoneNumbers.length == 2
              ? record.phoneNumbers[1]?.number
              : "";
          n = `${record.phoneNumbers[0].number}${number2}`;
        }
        if (record.emails) e = record.emails[0].email;
        return (
          String(record.firstName).toLowerCase().includes(v) ||
          String(record.middleName).toLowerCase().includes(v) ||
          String(record.lastName).toLowerCase().includes(v) ||
          String(record.office.name).toLowerCase().includes(v) ||
          String(e).toLowerCase().includes(v) ||
          String(n).toLowerCase().includes(v)
        );
      },
    },
    {
      title: "Loan Officer",
      dataIndex: "isLoanOfficer",
      key: "isLoanOfficer",
      render: (_, record) => {
        return <TableRowCheck check={record.isLoanOfficer} />;
      },
    },
    {
      title: "Mobile Number",
      dataIndex: "mobileNo",
      key: "mobileNo",
      render: (_, record) => {
        if (record.phoneNumbers) {
          const number2 =
            record.phoneNumbers.length == 2
              ? `, ${record.phoneNumbers[1]?.number}`
              : "";
          return `${record.phoneNumbers[0].number}${number2}`;
        }
      },
      exportValue: (_, record) => {
        if (record.phoneNumbers) {
          const number2 =
            record.phoneNumbers.length == 2
              ? `, ${record.phoneNumbers[1]?.number}`
              : "";
          return `${record.phoneNumbers[0].number}${number2}`;
        }
        return "";
      },
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (_, record) => {
        if (record.emails) return record.emails[0].email;
      },
      exportValue: (_, record) => record.emails?.[0]?.email || "",
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (_, record) => {
        const isActive = record.isActive || false;
        return <TableRowStatus status={isActive} />;
      },
    },
    {
      title: "Office",
      dataIndex: "office",
      key: "office",
      render: (_, record) => record.office.name,
      sorter: (a, b) => a.office.name.length - b.office.name.length,
      exportValue: (_, record) => record.office.name,
    },
  ];

  return (
    <MyDataTable<Employee>
      columns={columns}
      data={data}
      loading={loading}
      tableHeader={{
        setSearchedText,
        exportFileName: PAGE_TITLE,
      }}
    />
  );
}
