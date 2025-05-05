"use client";
import MyDataTable from "@/components/data-table";
import { AuditLog, ExtendedTableColumn, Fund } from "@/types";
import { Tag } from "antd";
import { useState } from "react";
import { PAGE_TITLE } from "./constants";

export default function DataTable(props: { data: any; loading: boolean }) {
  const { data, loading } = props;
  const [searchedText, setSearchedText] = useState("");

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case "create":
        return "green";
      case "update":
        return "blue";
      case "delete":
        return "red";
      default:
        return "gray";
    }
  };

  const columns: ExtendedTableColumn<AuditLog>[] = [
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render: (action: string) => (
        <Tag color={getActionColor(action)}>{action.toUpperCase()}</Tag>
      ),
      filteredValue: [searchedText],
      onFilter: (value, record) => {
        const v = value as string;
        return (
          String(record.action).toLowerCase().includes(v) ||
          String(record.modelName).toLowerCase().includes(v) ||
          String(record.entityId).toLowerCase().includes(v) ||
          String(record.userId).toLowerCase().includes(v) ||
          String(record.timestamp).toLowerCase().includes(v)
        );
      },
    },
    {
      title: "Entity",
      dataIndex: "modelName",
      key: "modelName",
    },
    {
      title: "Entity ID",
      dataIndex: "entityId",
      key: "entityId",
    },
    {
      title: "Performed By",
      dataIndex: "userId",
      key: "userId",
      render: (_, record) =>
        `${record.user?.person.firstName} ${
          record.user?.person.middleName || ""
        } ${record.user?.person.lastName}`,

      exportValue: (_, record) =>
        `${record.user?.person.firstName} ${
          record.user?.person.middleName || ""
        } ${record.user?.person.lastName}`,
    },
    {
      title: "Timestamp",
      dataIndex: "timestamp",
      key: "timestamp",
      render: (timestamp: Date) => new Date(timestamp).toLocaleString(),
      sorter: (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    },
  ];

  return (
    <MyDataTable<AuditLog>
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
