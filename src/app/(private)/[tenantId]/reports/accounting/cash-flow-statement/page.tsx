"use client";
import React, { useState, useMemo, useCallback } from "react";
import { Table, Card, Button, Typography, Spin, Tabs } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  PrinterOutlined,
  DownloadOutlined,
  FundOutlined,
  BankOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useGet } from "@/api";
import { formatCurrency } from "@/utils/currency";
import { GlJournalEntry, Office } from "@/types";
import {
  CashFlowItem,
  CashFlowSummary,
  CategoryMapping,
  DEFAULT_CATEGORY_MAPPINGS,
  GlAccount,
} from "../types";
import ReportFilter from "../../components/report-filter";
import { useParams } from "next/navigation";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const CashFlowStatementPage: React.FC = () => {
  const { tenantId } = useParams();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().startOf("month"),
    dayjs(),
  ]);
  const [selectedOffice, setSelectedOffice] = useState<number | null>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("summary");
  const [categoryMappings, setCategoryMappings] = useState<CategoryMapping[]>(
    DEFAULT_CATEGORY_MAPPINGS
  );

  // Fetch necessary data
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

  const { status: accountsStatus, data: accountsData } = useGet<GlAccount[]>(
    `${tenantId}/gl-accounts`,
    [`${tenantId}/gl-accounts`]
  );

  // Determine the category of an account
  const getAccountCategory = useCallback(
    (
      account: GlAccount
    ): {
      type: "OPERATING" | "INVESTING" | "FINANCING";
      name: string;
    } => {
      // Find the first matching category pattern
      const matchedCategory = categoryMappings.find((mapping) => {
        const { codeStartsWith, codeRange, accountType } = mapping.patterns;

        // Check code prefix matches
        if (
          codeStartsWith?.some((prefix) => account.glCode.startsWith(prefix))
        ) {
          return true;
        }

        // Check code range (if defined)
        if (
          codeRange &&
          account.glCode >= codeRange[0] &&
          account.glCode <= codeRange[1]
        ) {
          return true;
        }

        // Check account type (if available)
        if (accountType?.includes(account.type.codeValue)) {
          return true;
        }

        return false;
      });

      // Default to operating if no match found
      return matchedCategory
        ? { type: matchedCategory.type, name: matchedCategory.name }
        : { type: "OPERATING", name: "Other Operating Activities" };
    },
    [categoryMappings]
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

  // Process journal entries into cash flow format
  const cashFlowItems = useMemo(() => {
    if (!accountsData || accountsStatus !== "success") return [];

    const itemsMap = new Map<string, CashFlowItem>();
    const accountMap = new Map<number, GlAccount>(
      accountsData.map((account) => [account.id, account])
    );

    filteredEntries.forEach((entry) => {
      const { glAccountId, typeEnum, amount } = entry;
      const account = accountMap.get(glAccountId);

      if (!account) return;

      const { type: category, name: categoryName } =
        getAccountCategory(account);
      const key = `${glAccountId}`;

      // Determine cash effect based on entry type
      const cashEffect = typeEnum === "DEBIT" ? amount : -amount;

      if (!itemsMap.has(key)) {
        itemsMap.set(key, {
          key,
          accountId: glAccountId,
          accountCode: account.glCode,
          accountName: account.name,
          category,
          categoryName,
          amount: 0,
        });
      }

      // Update the amount
      const item = itemsMap.get(key)!;
      item.amount += cashEffect;
    });

    // Convert map to array and filter
    return Array.from(itemsMap.values())
      .filter((item) => item.amount !== 0)
      .filter((item) => {
        if (!searchText) return true;
        return (
          item.accountName.toLowerCase().includes(searchText.toLowerCase()) ||
          item.accountCode.includes(searchText) ||
          item.categoryName.toLowerCase().includes(searchText.toLowerCase())
        );
      })
      .sort((a, b) => a.accountCode.localeCompare(b.accountCode));
  }, [
    filteredEntries,
    accountsData,
    accountsStatus,
    searchText,
    getAccountCategory,
  ]);

  // Generate summary data for the cash flow statement
  const cashFlowSummary = useMemo(() => {
    // Group items by category name first for more detailed breakdown
    const categoryGroups = cashFlowItems.reduce((acc, item) => {
      if (!acc[item.categoryName]) {
        acc[item.categoryName] = {
          type: item.category,
          items: [],
          total: 0,
        };
      }
      acc[item.categoryName].items.push(item);
      acc[item.categoryName].total += item.amount;
      return acc;
    }, {} as Record<string, { type: "OPERATING" | "INVESTING" | "FINANCING"; items: CashFlowItem[]; total: number }>);

    // Calculate category totals
    const operatingTotal = Object.entries(categoryGroups)
      .filter(([_, group]) => group.type === "OPERATING")
      .reduce((sum, [_, group]) => sum + group.total, 0);

    const investingTotal = Object.entries(categoryGroups)
      .filter(([_, group]) => group.type === "INVESTING")
      .reduce((sum, [_, group]) => sum + group.total, 0);

    const financingTotal = Object.entries(categoryGroups)
      .filter(([_, group]) => group.type === "FINANCING")
      .reduce((sum, [_, group]) => sum + group.total, 0);

    const netCashChange = operatingTotal + investingTotal + financingTotal;

    // Create the summary items with hierarchical structure
    const summary: CashFlowSummary[] = [];

    // Operating Activities
    summary.push({
      key: "operating-header",
      description: "Cash Flows from Operating Activities",
      amount: 0,
      isBold: true,
    });

    Object.entries(categoryGroups)
      .filter(([_, group]) => group.type === "OPERATING")
      .forEach(([name, group]) => {
        group.items.forEach((item) => {
          summary.push({
            key: `item-${item.accountId}`,
            description: `${item.accountName} (${item.accountCode})`,
            amount: item.amount,
          });
        });
        summary.push({
          key: `subtotal-${name}`,
          description: `${name} Subtotal`,
          amount: group.total,
          isSubtotal: true,
        });
      });

    summary.push({
      key: "operating-total",
      description: "Net Cash from Operating Activities",
      amount: operatingTotal,
      isTotal: true,
    });

    // Investing Activities
    summary.push({
      key: "investing-header",
      description: "Cash Flows from Investing Activities",
      amount: 0,
      isBold: true,
    });

    Object.entries(categoryGroups)
      .filter(([_, group]) => group.type === "INVESTING")
      .forEach(([name, group]) => {
        group.items.forEach((item) => {
          summary.push({
            key: `item-${item.accountId}`,
            description: `${item.accountName} (${item.accountCode})`,
            amount: item.amount,
          });
        });
        summary.push({
          key: `subtotal-${name}`,
          description: `${name} Subtotal`,
          amount: group.total,
          isSubtotal: true,
        });
      });

    summary.push({
      key: "investing-total",
      description: "Net Cash from Investing Activities",
      amount: investingTotal,
      isTotal: true,
    });

    // Financing Activities
    summary.push({
      key: "financing-header",
      description: "Cash Flows from Financing Activities",
      amount: 0,
      isBold: true,
    });

    Object.entries(categoryGroups)
      .filter(([_, group]) => group.type === "FINANCING")
      .forEach(([name, group]) => {
        group.items.forEach((item) => {
          summary.push({
            key: `item-${item.accountId}`,
            description: `${item.accountName} (${item.accountCode})`,
            amount: item.amount,
          });
        });
        summary.push({
          key: `subtotal-${name}`,
          description: `${name} Subtotal`,
          amount: group.total,
          isSubtotal: true,
        });
      });

    summary.push({
      key: "financing-total",
      description: "Net Cash from Financing Activities",
      amount: financingTotal,
      isTotal: true,
    });

    // Net change
    summary.push({
      key: "net-change",
      description: "Net Increase (Decrease) in Cash",
      amount: netCashChange,
      isBold: true,
      isTotal: true,
    });

    return summary;
  }, [cashFlowItems]);

  // Detail view columns
  const detailColumns = useMemo<ColumnsType<CashFlowItem>>(
    () => [
      {
        title: "Account Code",
        dataIndex: "accountCode",
        key: "accountCode",
        width: "15%",
        sorter: (a, b) => a.accountCode.localeCompare(b.accountCode),
      },
      {
        title: "Account Name",
        dataIndex: "accountName",
        key: "accountName",
        width: "30%",
      },
      {
        title: "Category",
        dataIndex: "categoryName",
        key: "category",
        width: "25%",
        filters: Array.from(
          new Set(cashFlowItems.map((item) => item.categoryName))
        ).map((name) => ({
          text: name,
          value: name,
        })),
        onFilter: (value, record) => record.categoryName === value,
      },
      {
        title: "Amount",
        dataIndex: "amount",
        key: "amount",
        width: "30%",
        align: "right" as const,
        render: (value) => (
          <Text style={{ color: value >= 0 ? "#52c41a" : "#f5222d" }}>
            {formatCurrency(value, "USh", 0)}
          </Text>
        ),
        sorter: (a, b) => a.amount - b.amount,
      },
    ],
    [cashFlowItems]
  );

  // Summary view columns
  const summaryColumns = useMemo<ColumnsType<CashFlowSummary>>(
    () => [
      {
        title: "Description",
        dataIndex: "description",
        key: "description",
        width: "75%",
        render: (text, record) => (
          <Text
            strong={record.isBold}
            style={{
              paddingLeft: record.isTotal
                ? "20px"
                : record.isSubtotal
                ? "40px"
                : record.isBold
                ? "0px"
                : "60px",
            }}
          >
            {text}
          </Text>
        ),
      },
      {
        title: "Amount",
        dataIndex: "amount",
        key: "amount",
        width: "25%",
        align: "right" as const,
        render: (value, record) => (
          <Text
            strong={record.isBold || record.isTotal || record.isSubtotal}
            style={{ color: value >= 0 ? "#52c41a" : "#f5222d" }}
          >
            {record.isBold && !record.amount
              ? ""
              : formatCurrency(value, "USh", 0)}
          </Text>
        ),
      },
    ],
    []
  );

  // Event handlers
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleExport = useCallback(() => {
    alert("Export functionality would be implemented here");
  }, []);

  const handleClearFilters = useCallback(() => {
    setDateRange([dayjs().startOf("month"), dayjs()]);
    setSelectedOffice(null);
    setSearchText("");
  }, []);

  const handleDateRangeChange = useCallback((dates: any) => {
    if (dates) {
      setDateRange([dates[0]!, dates[1]!]);
    }
  }, []);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchText(e.target.value);
    },
    []
  );

  if (
    journalStatus === "pending" ||
    officesStatus === "pending" ||
    accountsStatus === "pending"
  ) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (journalError) {
    return <div>Error loading data: {journalError.message}</div>;
  }

  // Calculate totals for display
  const operatingTotal = cashFlowItems
    .filter((item) => item.category === "OPERATING")
    .reduce((sum, item) => sum + item.amount, 0);

  const investingTotal = cashFlowItems
    .filter((item) => item.category === "INVESTING")
    .reduce((sum, item) => sum + item.amount, 0);

  const financingTotal = cashFlowItems
    .filter((item) => item.category === "FINANCING")
    .reduce((sum, item) => sum + item.amount, 0);

  const netCashChange = operatingTotal + investingTotal + financingTotal;

  return (
    <Card>
      <div className="flex justify-between items-center mb-6">
        <Title level={3}>Cash Flow Statement</Title>
        <div className="flex space-x-2">
          <Button icon={<PrinterOutlined />} onClick={handlePrint}>
            Print
          </Button>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>
            Export
          </Button>
        </div>
      </div>

      {/* <div className="mt-6">
        <Divider>Cash Flow Summary</Divider>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="text-center">
            <DollarOutlined
              style={{
                fontSize: "24px",
                color: operatingTotal >= 0 ? "#52c41a" : "#f5222d",
              }}
            />
            <div className="mt-2">
              <Text strong>Operating Activities</Text>
              <div
                style={{
                  color: operatingTotal >= 0 ? "#52c41a" : "#f5222d",
                  fontWeight: "bold",
                }}
              >
                {formatCurrency(operatingTotal 
, "USh", 0)}
              </div>
            </div>
          </Card>
          <Card className="text-center">
            <FundOutlined
              style={{
                fontSize: "24px",
                color: investingTotal >= 0 ? "#52c41a" : "#f5222d",
              }}
            />
            <div className="mt-2">
              <Text strong>Investing Activities</Text>
              <div
                style={{
                  color: investingTotal >= 0 ? "#52c41a" : "#f5222d",
                  fontWeight: "bold",
                }}
              >
                {formatCurrency(investingTotal 
, "USh", 0)}
              </div>
            </div>
          </Card>
          <Card className="text-center">
            <BankOutlined
              style={{
                fontSize: "24px",
                color: financingTotal >= 0 ? "#52c41a" : "#f5222d",
              }}
            />
            <div className="mt-2">
              <Text strong>Financing Activities</Text>
              <div
                style={{
                  color: financingTotal >= 0 ? "#52c41a" : "#f5222d",
                  fontWeight: "bold",
                }}
              >
                {formatCurrency(financingTotal 
, "USh", 0)}
              </div>
            </div>
          </Card>
        </div>
      </div> */}

      {/* <Alert
        message="Cash Flow Categorization"
        description="Accounts are automatically categorized based on their account codes and types. Please review the mappings in settings if adjustments are needed."
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        className="mb-4"
      /> */}

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
          <Text strong>Net Cash Change: </Text>{" "}
          <Text
            strong
            style={{
              color: netCashChange >= 0 ? "#52c41a" : "#f5222d",
              fontSize: "16px",
            }}
          >
            {formatCurrency(netCashChange, "USh", 0)}
            {netCashChange >= 0 ? " (Positive)" : " (Negative)"}
          </Text>
        </div>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane
          tab={
            <span>
              <FundOutlined /> Summary View
            </span>
          }
          key="summary"
        >
          <Table
            columns={summaryColumns}
            dataSource={cashFlowSummary}
            pagination={false}
            showHeader={false}
            rowClassName={(record) =>
              record.isTotal
                ? "bg-gray-100"
                : record.isSubtotal
                ? "bg-gray-50"
                : record.isBold
                ? "font-bold mt-4"
                : ""
            }
          />
        </TabPane>
        <TabPane
          tab={
            <span>
              <BankOutlined /> Detail View
            </span>
          }
          key="detail"
        >
          <Table
            columns={detailColumns}
            dataSource={cashFlowItems}
            pagination={{ pageSize: 50 }}
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={3}>
                    <strong>Net Cash Change</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3} align="right">
                    <Text
                      strong
                      style={{
                        color: netCashChange >= 0 ? "#52c41a" : "#f5222d",
                      }}
                    >
                      {formatCurrency(netCashChange, "USh", 0)}
                    </Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default CashFlowStatementPage;
