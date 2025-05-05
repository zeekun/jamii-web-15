"use client";
import MyDataTable from "@/components/data-table";
import TableRowCheck from "@/components/table-row-check";
import TableRowStatus from "@/components/table-row-status";
import { ExtendedTableColumn, GLAccount } from "@/types";
import { useState } from "react";
import { PAGE_TITLE } from "./constants";
import _ from "lodash";

export default function DataTable(props: { data: any; loading: boolean }) {
  const { data, loading } = props;

  const [searchedText, setSearchedText] = useState("");

  const columns: ExtendedTableColumn<GLAccount>[] = [
    {
      title: "Account",
      dataIndex: "name",
      key: "name",
      render: (text) => <a>{text}</a>,
      // Export will use the raw data (record.name) by default
      sorter: (a, b) => a.name.length - b.name.length,
      filteredValue: [searchedText],
      onFilter: (value, record) => {
        const v = value as string;
        return (
          String(record.name).toLowerCase().includes(v) ||
          String(record.glCode).toLowerCase().includes(v) ||
          String(record.type.codeValue).toLowerCase().includes(v) ||
          String(record.isActive).toLowerCase().includes(v) ||
          String(record.manualEntriesAllowed).toLowerCase().includes(v) ||
          String(record.usage.codeValue).toLowerCase().includes(v)
        );
      },
    },
    {
      title: "GL Code",
      dataIndex: "glCode",
      key: "glCode",
      render: (_, record) => record.glCode,
      sorter: (a, b) => a.glCode.length - b.glCode.length,
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      // For export, we'll use codeValue from the type object
      exportValue: (_, record) => record.type.codeValue,
      render: (_, record) => record.type.codeValue, // Consistent with export
      sorter: (a, b) => a.type.codeValue.length - b.type.codeValue.length,
    },
    {
      title: "Is Active",
      dataIndex: "isActive",
      key: "isActive",
      // Convert boolean to "Yes"/"No" for export
      exportValue: (_, record) => (record.isActive ? "Yes" : "No"),
      render: (_, record) => <TableRowStatus status={record.isActive} />,
    },
    {
      title: "Manual Entries Allowed",
      dataIndex: "manualEntriesAllowed",
      key: "manualEntriesAllowed",
      // Convert boolean to "Allowed"/"Not Allowed" for export
      exportValue: (_, record) =>
        record.manualEntriesAllowed ? "Allowed" : "Not Allowed",
      render: (_, record) => (
        <TableRowCheck check={record.manualEntriesAllowed} />
      ),
    },
    {
      title: "Used As",
      dataIndex: "usage",
      key: "usage",
      // Use codeValue for both display and export
      exportValue: (_, record) => record.usage.codeValue,
      render: (_, record) => record.usage.codeValue,
      sorter: (a, b) => a.usage.codeValue.length - b.usage.codeValue.length,
    },
  ];

  return (
    <MyDataTable<GLAccount>
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
