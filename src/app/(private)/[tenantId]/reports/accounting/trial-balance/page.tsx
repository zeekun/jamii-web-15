"use client";
import React, { useState, useMemo, useCallback } from "react";
import { Table, Card, Button, Typography, Spin, Alert } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PrinterOutlined, DownloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useGet } from "@/api";
import { formatCurrency } from "@/utils/currency";
import { GlJournalEntry, Office } from "@/types";
import { TrialBalanceRow } from "../types";
import ReportFilter from "../../components/report-filter";
import { useParams } from "next/navigation";

const { Title, Text } = Typography;

const TrialBalancePage: React.FC = () => {
  const { tenantId } = useParams();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().startOf("month"),
    dayjs(),
  ]);
  const [selectedOffice, setSelectedOffice] = useState<number | null>(null);
  const [searchText, setSearchText] = useState<string>("");

  const {
    status: journalStatus,
    data: journalData,
    error: journalError,
  } = useGet<GlJournalEntry[]>(`${tenantId}/gl-journal-entries`, [
    `${tenantId}/gl-journal-entries`,
  ]);

  const { status: officesStatus, data: officesData } = useGet<Office[]>(
    `${tenantId}/offices`,
    [`${tenantId}/offices`]
  );

  // Memoize the filtered entries based on date range and office selection
  const filteredEntries = useMemo(() => {
    if (journalStatus !== "success" || !journalData) return [];

    return journalData.filter((entry) => {
      const entryDate = dayjs(entry.entryDate);
      const inDateRange =
        entryDate.isAfter(dateRange[0]) &&
        entryDate.isBefore(dateRange[1].add(1, "day"));
      const matchesOffice = selectedOffice
        ? entry.officeId === selectedOffice
        : true;

      return inDateRange && matchesOffice;
    });
  }, [journalData, journalStatus, dateRange, selectedOffice]);

  // Memoize the processed trial balance data
  const trialBalanceData = useMemo(() => {
    const accountMap = new Map<
      number,
      {
        accountId: number;
        accountCode: string;
        accountName: string;
        accountType: string;
        debit: number;
        credit: number;
      }
    >();

    // Process each entry
    filteredEntries.forEach((entry) => {
      const { glAccountId, glAccount, typeEnum, amount } = entry;

      if (!accountMap.has(glAccountId)) {
        accountMap.set(glAccountId, {
          accountId: glAccountId,
          accountCode: glAccount.glCode,
          accountName: glAccount.name,
          accountType: glAccount.type.codeValue,
          debit: 0,
          credit: 0,
        });
      }

      const account = accountMap.get(glAccountId)!;

      if (typeEnum === "DEBIT") {
        account.debit += amount;
      } else {
        account.credit += amount;
      }
    });

    // Convert map to array and sort by account code
    return Array.from(accountMap.values())
      .map((account) => ({
        key: account.accountId.toString(),
        ...account,
      }))
      .filter((account) => account.debit > 0 || account.credit > 0)
      .filter((account) => {
        if (!searchText) return true;
        return (
          account.accountName
            .toLowerCase()
            .includes(searchText.toLowerCase()) ||
          account.accountCode.includes(searchText)
        );
      })
      .sort((a, b) => a.accountCode.localeCompare(b.accountCode));
  }, [filteredEntries, searchText]);

  // Memoize totals and balance calculations
  const { totalDebit, totalCredit, netDifference, isBalanced } = useMemo(() => {
    const totalDebit = trialBalanceData.reduce(
      (sum, row) => sum + row.debit,
      0
    );
    const totalCredit = trialBalanceData.reduce(
      (sum, row) => sum + row.credit,
      0
    );
    const netDifference = totalDebit - totalCredit;
    const isBalanced = netDifference === 0;

    return { totalDebit, totalCredit, netDifference, isBalanced };
  }, [trialBalanceData]);

  // Memoize columns to prevent unnecessary re-renders
  const columns = useMemo<ColumnsType<TrialBalanceRow>>(
    () => [
      {
        title: "Account Code",
        dataIndex: "accountCode",
        key: "accountCode",
        width: "15%",
      },
      {
        title: "Account Name",
        dataIndex: "accountName",
        key: "accountName",
        width: "40%",
      },
      {
        title: "Account Type",
        dataIndex: "accountType",
        key: "accountType",
        width: "15%",
      },
      {
        title: "Debit",
        dataIndex: "debit",
        key: "debit",
        width: "15%",
        align: "right" as const,
        render: (value) => formatCurrency(value, "USh", 0), // Assuming amount is in cents
      },
      {
        title: "Credit",
        dataIndex: "credit",
        key: "credit",
        width: "15%",
        align: "right" as const,
        render: (value) => formatCurrency(value, "USh", 0), // Assuming amount is in cents
      },
    ],
    []
  );

  // Use useCallback for event handlers
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleExport = useCallback(() => {
    // Implement CSV export logic here
    alert("Export functionality would be implemented here");
  }, []);

  const handleClearFilters = useCallback(() => {
    setDateRange([dayjs().startOf("month"), dayjs()]);
    setSelectedOffice(null);
    setSearchText("");
  }, []);

  // Memoize the RangePicker's onChange handler
  const handleDateRangeChange = useCallback((dates: any) => {
    if (dates) {
      setDateRange([dates[0]!, dates[1]!]);
    }
  }, []);

  // Memoize the search input's onChange handler
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchText(e.target.value);
    },
    []
  );

  if (journalStatus === "pending" || officesStatus === "pending") {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (journalError) {
    return <div>Error loading data: {journalError.message}</div>;
  }

  return (
    <Card>
      <div className="flex justify-between items-center mb-6">
        <Title level={3}>Trial Balance</Title>
        <div className="flex space-x-2">
          <Button icon={<PrinterOutlined />} onClick={handlePrint}>
            Print
          </Button>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>
            Export
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 justify-between items-center md:flex-row md:space-x-4 space-y-4 md:space-y-0 mb-6">
        <div className="flex items-center gap-3">
          <ReportFilter
            dateRange={dateRange}
            setDateRange={setDateRange}
            selectedOffice={selectedOffice}
            setSelectedOffice={setSelectedOffice}
            searchText={searchText}
            setSearchText={setSearchText}
            handleClearFilters={handleClearFilters}
            officesData={officesData}
          />
        </div>

        <div>
          <Text strong>Net: </Text>{" "}
          <Text
            strong
            style={{
              color: isBalanced ? "#52c41a" : "#f5222d",
              fontSize: "16px",
            }}
          >
            {formatCurrency(Math.abs(netDifference), "USh", 0)}
            {isBalanced ? " (Balanced)" : " (Unbalanced)"}
          </Text>
        </div>
      </div>

      <div className="mb-6">
        {!isBalanced && (
          <Alert
            message="Warning: Trial balance is not balanced!"
            description={`There is a ${
              netDifference > 0 ? "debit" : "credit"
            } excess of ${formatCurrency(Math.abs(netDifference), "USh", 0)}`}
            type="warning"
            showIcon
            className="mt-2"
          />
        )}
      </div>

      <Table
        columns={columns}
        dataSource={trialBalanceData}
        pagination={{ pageSize: 50 }}
        summary={() => (
          <Table.Summary fixed>
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={3}>
                <strong>Total</strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1} align="right">
                <strong>{formatCurrency(totalDebit, "USh", 0)}</strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={2} align="right">
                <strong>{formatCurrency(totalCredit, "USh", 0)}</strong>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          </Table.Summary>
        )}
      />
    </Card>
  );
};

export default TrialBalancePage;
0;
