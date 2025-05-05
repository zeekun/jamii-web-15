"use client";
import MyDataTable from "@/components/data-table";
import { Cashier, ExtendedTableColumn } from "@/types";
import { formattedDate } from "@/utils/dates";
import { useState } from "react";

export default function CashiersDataTable(props: {
  data: any;
  loading: boolean;
}) {
  const { data, loading } = props;
  const [searchedText, setSearchedText] = useState("");

  const columns: ExtendedTableColumn<Cashier>[] = [
    {
      title: "Period",
      dataIndex: "period",
      key: "period",
      render: (_, record) =>
        `${formattedDate(record.startDate)} - ${formattedDate(record.endDate)}`,
      exportValue: (_, record) =>
        `${formattedDate(record.startDate)} - ${formattedDate(record.endDate)}`,
      filteredValue: [searchedText],
      onFilter: (value, record) => {
        const v = value as string;
        return (
          String(record.staff.firstName).toLowerCase().includes(v) ||
          String(record.staff.middleName).toLowerCase().includes(v) ||
          String(record.staff.lastName).toLowerCase().includes(v) ||
          String(record.description).toLowerCase().includes(v)
        );
      },
    },
    {
      title: "Cashier/Staff",
      dataIndex: "cashier",
      key: "cashier",
      render: (_, record) =>
        `${record.staff.firstName} ${record.staff.middleName || ""} ${
          record.staff.lastName
        }`,

      exportValue: (_, record) =>
        `${record.staff.firstName} ${record.staff.middleName || ""} ${
          record.staff.lastName
        }`,
    },
    {
      title: "Full Day/Time",
      dataIndex: "status",
      key: "status",
      exportValue: (_, record) =>
        record.fullDay
          ? "Yes"
          : `${formattedDate(
              String(record.startTime),
              "h:mm A"
            )} - ${formattedDate(String(record.endTime), "h:mm A")} `,
      render: (_, record) =>
        record.fullDay
          ? "Yes"
          : `${formattedDate(
              String(record.startTime),
              "h:mm A"
            )} - ${formattedDate(String(record.endTime), "h:mm A")} `,
    },
  ];

  const currentPath = window.location.pathname;

  return (
    <MyDataTable<Cashier>
      columns={columns}
      data={data}
      loading={loading}
      tableHeader={{
        setSearchedText,
        exportFileName: "Cashier",
      }}
      redirectUrl={`${currentPath}/cashiers`}
    />
  );
}
