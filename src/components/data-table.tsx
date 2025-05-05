"use client";
import { Skeleton, Table } from "antd";
import TableHeader from "./table-header";
import { useRowClickHandler } from "@/hooks/table-row-click";
import MyButton from "./my-button";
import {
  FileExcelOutlined,
  PrinterOutlined,
  FilePdfOutlined,
  FileWordOutlined,
} from "@ant-design/icons";
import React from "react";
import { exportData, ExportType } from "@/utils/data-export";
import { useSession } from "next-auth/react";
import { ExtendedTableColumn, MySession } from "@/types";
import { TableRowSelection } from "antd/es/table/interface";

export default function MyDataTable<T extends { id?: string | number }>(props: {
  tableHeader?: {
    setSearchedText?: (value: string) => void;
    exportToExcel?: boolean;
    exportFileName?: string;
    showExportOptions?: boolean;
  };
  columns: ExtendedTableColumn<T>[];
  data: T[];
  loading: boolean;
  redirectUrl?: string;
  rowType?: string;
  clickRow?: boolean;
  rowSelection?: TableRowSelection<T>;
  exportTypes?: ExportType[];
  tableName?: string;
}) {
  const {
    tableHeader,
    columns,
    data,
    loading,
    redirectUrl,
    rowType,
    rowSelection,
    tableName = "",
    clickRow = true,
    exportTypes = ["excel", "print", "pdf", "word"],
  } = props;

  console.log(tableHeader);

  const { data: session } = useSession();
  const mySession = session as MySession | null;

  const { onRow } = useRowClickHandler<T>({
    url: redirectUrl,
    rowType,
    clickRow,
  });

  const isExportTypeEnabled = (type: ExportType) => exportTypes.includes(type);

  const renderExportButtons = () => {
    const buttons = [];

    if (isExportTypeEnabled("print")) {
      buttons.push(
        <MyButton
          key="print"
          type="default"
          icon={<PrinterOutlined />}
          onClick={() =>
            exportData({ type: "print", data, columns, tableHeader })
          }
          style={{ marginRight: 8 }}
        />
      );
    }

    if (isExportTypeEnabled("excel")) {
      buttons.push(
        <MyButton
          key="excel"
          type="green"
          icon={<FileExcelOutlined />}
          onClick={() =>
            exportData({ type: "excel", data, columns, tableHeader })
          }
          style={{ marginRight: 8 }}
        />
      );
    }

    if (isExportTypeEnabled("pdf")) {
      buttons.push(
        <MyButton
          key="pdf"
          type="danger"
          icon={<FilePdfOutlined />}
          onClick={() =>
            exportData({ type: "pdf", data, columns, tableHeader })
          }
          style={{ marginRight: 8 }}
        />
      );
    }

    if (isExportTypeEnabled("word")) {
      buttons.push(
        <MyButton
          key="word"
          type="primary"
          icon={<FileWordOutlined />}
          onClick={() =>
            exportData({ type: "word", data, columns, tableHeader })
          }
        />
      );
    }

    return buttons;
  };

  return (
    <>
      {loading ? (
        <Skeleton />
      ) : (
        <>
          {tableHeader && (
            <TableHeader
              setSearchedText={tableHeader?.setSearchedText}
              extra={
                tableHeader.showExportOptions !== false && (
                  <div className="flex">
                    {!tableHeader?.exportToExcel && renderExportButtons()}
                  </div>
                )
              }
              activeSession={mySession}
            />
          )}

          {rowSelection ? (
            <Table
              rowKey={(record: T) => `${tableName}-${record.id}`}
              bordered
              rowSelection={rowSelection}
              onRow={onRow}
              columns={columns}
              dataSource={data}
              size="middle"
            />
          ) : (
            <Table
              rowKey={(record: T) => `${tableName}-${record.id}`}
              onRow={onRow}
              bordered
              columns={columns}
              dataSource={data}
            />
          )}
        </>
      )}
    </>
  );
}
