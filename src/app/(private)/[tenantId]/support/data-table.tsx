"use client";
import TableHeader from "@/components/table-header";
import { SupportTicket } from "@/types";
import type { TableProps } from "antd";
import { Tag } from "antd";
import { useState } from "react";
import Link from "next/link";
import { formatDuration, formattedDate } from "@/utils/dates";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import MyDataTable from "@/components/data-table";

dayjs.extend(duration);

export default function SupportTicketsTable(props: {
  data: SupportTicket[];
  loading: boolean;
}) {
  const { data, loading } = props;
  const [searchedText, setSearchedText] = useState("");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "blue";
      case "in_progress":
        return "orange";
      case "resolved":
        return "green";
      case "closed":
        return "gray";
      default:
        return "default";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "issue":
        return "red";
      case "feedback":
        return "purple";
      case "question":
        return "blue";
      case "feature_request":
        return "cyan";
      default:
        return "default";
    }
  };

  const columns: TableProps<SupportTicket>["columns"] = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (_, record) => {
        return <Link href={`/support/${record.id}`}>{record.title}</Link>;
      },
      filteredValue: [searchedText],
      onFilter: (value, record) => {
        const v = value as string;
        return String(record.title).toLowerCase().includes(v.toLowerCase());
      },
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type) => (
        <Tag color={getTypeColor(type)}>
          {type
            .split("_")
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")}
        </Tag>
      ),
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      render: (priority) => (
        <Tag
          color={
            priority === "high"
              ? "red"
              : priority === "medium"
              ? "orange"
              : priority === "critical"
              ? "#f50"
              : "green"
          }
        >
          {priority.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status
            .split("_")
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")}
        </Tag>
      ),
    },
    {
      title: "Created By",
      dataIndex: "createdById",
      key: "createdById",
      render: (_, record) =>
        `${record.createdBy.person.firstName} ${
          record.createdBy.person.middleName || ""
        } ${record.createdBy.person.lastName}`,
    },
    {
      title: "Assigned To",
      dataIndex: "assignedToId",
      key: "assignedToId",
      render: (_, record) => {
        return (
          record.assignedTo &&
          `${record.assignedTo?.firstName} ${
            record.assignedTo?.middleName || ""
          } ${record.assignedTo?.lastName}`
        );
      },
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (_, record) => {
        const createdAt = dayjs(record.createdAt);
        const now = dayjs();
        const duration = now.diff(createdAt, "milliseconds");
        return `${formattedDate(_)} - ${formatDuration(duration)}`;
      },
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
    },
    {
      title: "Last Updated",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (_, record) => {
        const updatedAt = dayjs(record.updatedAt);
        const now = dayjs();
        const duration = now.diff(updatedAt, "milliseconds");
        return `${formattedDate(_)} - ${formatDuration(duration)}`;
      },
      sorter: (a, b) => dayjs(a.updatedAt).unix() - dayjs(b.updatedAt).unix(),
    },
  ];

  return (
    <>
      <TableHeader setSearchedText={setSearchedText} />

      <MyDataTable<SupportTicket>
        columns={columns}
        data={data}
        loading={loading}
        tableName="support-ticket"
      />
    </>
  );
}
