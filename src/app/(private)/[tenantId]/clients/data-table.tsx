"use client";
import TableRowStatus from "@/components/table-row-status";
import { Client } from "@/types";
import type { TableProps } from "antd";
import { Button } from "antd";
import { useState } from "react";
import MyDataTable from "@/components/data-table";
import { useParams } from "next/navigation";
import { PlusOutlined } from "@ant-design/icons";
import LoanCreateModal from "./[id]/components/loans/create.modal";

export default function ClientsDataTable(props: {
  data: any;
  loading: boolean;
  group?: boolean;
}) {
  const { data, loading, group } = props;
  const { tenantId } = useParams();
  const [searchedText, setSearchedText] = useState("");

  const columns: TableProps<Client>["columns"] = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (_, record) => {
        return (
          <>
            {`${record.firstName || ""} ${
              record.middleName ? `${record.middleName} ` : ""
            }${record.lastName || ""}${record.fullName || ""}`}
          </>
        );
      },
      sorter: (a, b) => {
        const ac = `${a.fullName || ""} ${a.firstName || ""} ${
          a.middleName || ""
        } ${a.lastName || ""}`.trim();
        const bc = `${b.fullName || ""} ${b.firstName || ""} ${
          a.middleName || ""
        } ${a.lastName || ""}`.trim();

        return ac.localeCompare(bc);
      },

      filteredValue: [searchedText],
      onFilter: (value, record) => {
        const v = value as string;
        return (
          String(record.firstName).toLowerCase().includes(v) ||
          String(record.middleName).toLowerCase().includes(v) ||
          String(record.lastName).toLowerCase().includes(v) ||
          String(record.legalFormEnum).toLowerCase().includes(v)
        );
      },
    },

    {
      title: "Account No",
      dataIndex: "accountNo",
      key: "accountNo",
      sorter: (a, b) => {
        const ac = a.accountNo ? a.accountNo : "";
        const bc = b.accountNo ? b.accountNo : "";
        return ac.length - bc.length;
      },
      render: (_, record) => {
        return <span className="capitalize">{_}</span>;
      },
    },

    {
      title: "External Id",
      dataIndex: "externalId",
      key: "externalId",
      sorter: (a, b) => {
        const ac = a.externalId ? a.externalId : "";
        const bc = b.externalId ? b.externalId : "";
        return ac.length - bc.length;
      },
      render: (_, record) => {
        return <span className="capitalize">{_}</span>;
      },
    },

    {
      title: "Status",
      dataIndex: "statusEnum",
      key: "statusEnum",
      render: (_, record) => {
        let color;
        if (record.statusEnum === "PENDING") {
          color = "bg-orange-500";
        } else if (record.statusEnum === "ACTIVE") {
          color = "bg-green-700";
        } else if (
          record.statusEnum === "REJECTED" ||
          record.statusEnum === "WITHDRAWN" ||
          record.statusEnum === "CLOSED"
        ) {
          color = "bg-gray-700";
        } else {
          color = "bg-red-500";
        }
        return <TableRowStatus status={record.isActive} color={color} />;
      },
      sorter: (a, b) => {
        let ac = a.isActive ? "true" : "false";
        let bc = b.isActive ? "true" : "false";
        return ac.length - bc.length;
      },
    },
    {
      title: "Office",
      dataIndex: "office",
      key: "office",
      render: (_, record) => record.office.name,
      sorter: (a, b) => a.office.name.length - b.office.name.length,
    },
  ];

  if (group === true) {
    columns.push({
      title: <div className="text-right">Actions</div>,
      dataIndex: "id",
      key: "id",
      render: (_, record) => {
        return (
          <div
            className="flex justify-end"
            data-prevent-row-click
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {record.statusEnum === "ACTIVE" && (
              <LoanCreateModal
                submitType="create"
                client={record}
                jlg={true}
                // Make sure your modal trigger button also has:
                // data-prevent-row-click
              />
            )}
          </div>
        );
      },
    });
  }

  return (
    <MyDataTable<Client>
      columns={columns}
      data={data}
      loading={loading}
      redirectUrl={`/${tenantId}/clients`}
      tableHeader={{ setSearchedText }}
    />
  );
}
