"use client";
import { useRowClickHandler } from "@/hooks/table-row-click";
import { FinancialActivityTypeEnum, GLFinancialActivityAccount } from "@/types";
import type { TableProps } from "antd";
import { Table } from "antd";
import _ from "lodash";
import { useParams, useRouter } from "next/navigation";

export default function DataTable(props: { data: any; loading: boolean }) {
  const { data, loading } = props;
  const { onRow } = useRowClickHandler<GLFinancialActivityAccount>({
    clickRow: true,
  });

  const columns: TableProps<GLFinancialActivityAccount>["columns"] = [
    {
      title: "Financial Activity",
      dataIndex: "financialActivityTypeEnum",
      key: "financialActivityTypeEnum",
      render: (text: FinancialActivityTypeEnum) => (
        <span className="capitalize">
          {_.lowerCase(
            text === "CASH AT MAIN VAULT"
              ? "Main cash account or cash at vault"
              : text
          )}
        </span>
      ),
      sorter: (a, b) =>
        a.financialActivityTypeEnum.length - b.financialActivityTypeEnum.length,
    },
    {
      title: "Account Name",
      dataIndex: "glAccount",
      key: "glAccount",
      render: (_, record) =>
        `${record.glAccount.name} (${record.glAccount.glCode})`,
      sorter: (a, b) => a.glAccount.name.length - b.glAccount.name.length,
    },
  ];

  return (
    <div className="overflow-x-auto">
      <Table
        onRow={(record, rowIndex) => onRow(record, rowIndex)}
        columns={columns}
        dataSource={data}
        loading={loading}
      />
    </div>
  );
}
