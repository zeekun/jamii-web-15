"use client";
import { useGLAccountsData } from "@/hooks/gl-accounts";
import { useParams } from "next/navigation";
import { Typography, Card, Divider, Table, Spin, Alert } from "antd";
import { formatCurrency } from "@/utils/currency";
import { useGet } from "@/api";
import { GlJournalEntry, Office } from "@/types";
import { useCallback, useMemo, useState } from "react";
import dayjs from "dayjs";
import ReportFilter from "../../components/report-filter";

const { Title, Text } = Typography;

export default function IncomeStatement() {
  const { tenantId } = useParams();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().startOf("month"),
    dayjs(),
  ]);
  const [selectedOffice, setSelectedOffice] = useState<number | null>(null);
  const [searchText, setSearchText] = useState<string>("");

  // Fetch data
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

  const {
    data: glIncomeAccounts,
    status: incomeLoading,
    error: incomeError,
  } = useGLAccountsData("INCOME", `${tenantId}`);

  const {
    data: glExpenseAccounts,
    status: expenseLoading,
    error: expenseError,
  } = useGLAccountsData("EXPENSE", `${tenantId}`);

  // Check if all data has loaded
  const isLoading = journalStatus === "pending" || officesStatus === "pending";
  const hasError = incomeError || expenseError || journalStatus === "error";

  // Filter entries by date range and office
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

  // Create account maps with filtered amounts
  const incomeAccountMap = useMemo(() => {
    const map = new Map<
      string,
      { glCode: string; name: string; totalAmount: number }
    >();
    if (!glIncomeAccounts) return map;

    glIncomeAccounts.forEach((account) => {
      map.set(account.glCode, {
        glCode: account.glCode,
        name: account.name,
        totalAmount: 0, // Initialize to 0
      });
    });

    filteredEntries.forEach((entry) => {
      if (entry.glAccount.type.codeValue === "INCOME") {
        const account = map.get(entry.glAccount.glCode);
        if (account) {
          account.totalAmount +=
            entry.typeEnum === "CREDIT" ? entry.amount : -entry.amount;
        }
      }
    });

    return map;
  }, [filteredEntries, glIncomeAccounts]);

  const expenseAccountMap = useMemo(() => {
    const map = new Map<
      string,
      { glCode: string; name: string; totalAmount: number }
    >();
    if (!glExpenseAccounts) return map;

    glExpenseAccounts.forEach((account) => {
      map.set(account.glCode, {
        glCode: account.glCode,
        name: account.name,
        totalAmount: 0, // Initialize to 0
      });
    });

    filteredEntries.forEach((entry) => {
      if (entry.glAccount.type.codeValue === "EXPENSE") {
        const account = map.get(entry.glAccount.glCode);
        if (account) {
          account.totalAmount +=
            entry.typeEnum === "DEBIT" ? entry.amount : -entry.amount;
        }
      }
    });

    return map;
  }, [filteredEntries, glExpenseAccounts]);

  // Filter accounts based on search text
  const filteredIncomeAccounts = useMemo(() => {
    return Array.from(incomeAccountMap.values())
      .filter(
        (account) =>
          (account.name.toLowerCase().includes(searchText.toLowerCase()) ||
            account.glCode.includes(searchText)) &&
          account.totalAmount !== 0
      )
      .sort((a, b) => a.glCode.localeCompare(b.glCode));
  }, [incomeAccountMap, searchText]);

  const filteredExpenseAccounts = useMemo(() => {
    return Array.from(expenseAccountMap.values())
      .filter(
        (account) =>
          (account.name.toLowerCase().includes(searchText.toLowerCase()) ||
            account.glCode.includes(searchText)) &&
          account.totalAmount !== 0
      )
      .sort((a, b) => a.glCode.localeCompare(b.glCode));
  }, [expenseAccountMap, searchText]);

  // Calculate totals from filtered accounts
  const { totalIncome, totalExpenses, netIncome } = useMemo(() => {
    const incomeTotal = filteredIncomeAccounts.reduce(
      (sum, account) => sum + account.totalAmount,
      0
    );
    const expenseTotal = filteredExpenseAccounts.reduce(
      (sum, account) => sum + account.totalAmount,
      0
    );

    return {
      totalIncome: incomeTotal,
      totalExpenses: expenseTotal,
      netIncome: incomeTotal - expenseTotal,
    };
  }, [filteredIncomeAccounts, filteredExpenseAccounts]);

  const handleClearFilters = useCallback(() => {
    setDateRange([dayjs().startOf("month"), dayjs()]);
    setSelectedOffice(null);
    setSearchText("");
  }, []);

  const incomeColumns = [
    {
      title: "GL Code",
      dataIndex: "glCode",
      key: "glCode",
    },
    {
      title: "Account",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (value: number) => (
        <Text className="text-green-600">
          {formatCurrency(value, "USh", 2)}
        </Text>
      ),
      align: "right" as const,
    },
  ];

  const expenseColumns = [
    {
      title: "Account Code",
      dataIndex: "glCode",
      key: "glCode",
    },
    {
      title: "Account Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (value: number) => (
        <Text className="text-red-600">{formatCurrency(value, "USh", 2)}</Text>
      ),
      align: "right" as const,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="p-4 bg-red-50 rounded-lg">
        <Text type="danger">
          Error loading data:{" "}
          {incomeError?.message ||
            expenseError?.message ||
            journalError?.message}
        </Text>
      </div>
    );
  }

  return (
    <div className="mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <Title level={2} className="!mb-0">
          Income Statement
        </Title>
        <div className="text-sm text-gray-500">
          Period: {dateRange[0].format("MMM D, YYYY")} -{" "}
          {dateRange[1].format("MMM D, YYYY")}
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
          <Text strong>Net Income: </Text>
          <Text
            strong
            style={{
              color: netIncome >= 0 ? "#52c41a" : "#f5222d",
              fontSize: "16px",
            }}
          >
            {formatCurrency(netIncome, "USh", 2)}{" "}
            {netIncome >= 0
              ? `(${((netIncome / totalIncome) * 100).toFixed(2)}%)`
              : ""}
          </Text>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card
          title={<span className="font-semibold text-lg">Income</span>}
          className="shadow-lg"
          headStyle={{
            backgroundColor: "#52c41a10",
            borderBottom: "2px solid #52c41a",
            color: "#52c41a",
          }}
        >
          <Table
            columns={incomeColumns}
            dataSource={filteredIncomeAccounts}
            pagination={false}
            size="middle"
            bordered
            rowKey="glCode"
            footer={() => (
              <div className="flex justify-between font-semibold">
                <span>Total Income</span>
                <span className="text-green-600">
                  {formatCurrency(totalIncome, "USh", 2)}
                </span>
              </div>
            )}
          />
        </Card>

        <Card
          title={<span className="font-semibold text-lg">Expenses</span>}
          className="shadow-lg"
          headStyle={{
            backgroundColor: "#f5222d10",
            borderBottom: "2px solid #f5222d",
            color: "#f5222d",
          }}
        >
          <Table
            columns={expenseColumns}
            dataSource={filteredExpenseAccounts}
            pagination={false}
            size="middle"
            bordered
            rowKey="glCode"
            footer={() => (
              <div className="flex justify-between font-semibold">
                <span>Total Expenses</span>
                <span className="text-red-600">
                  {formatCurrency(totalExpenses, "USh", 2)}
                </span>
              </div>
            )}
          />
        </Card>
      </div>
    </div>
  );
}
