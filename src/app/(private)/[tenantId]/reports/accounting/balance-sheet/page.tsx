"use client";

import { useGet } from "@/api";
import { GlJournalEntry, Office } from "@/types";
import { Card, Spin, Table, Typography } from "antd";
import { ColumnType } from "antd/es/table";
import { useParams } from "next/navigation";
import { generateBalanceSheet } from "../utils";
import LiabilitiesEquityCard from "../../components/liabilities-equity-card";
import { useCallback, useMemo, useState } from "react";
import dayjs from "dayjs";
import ReportFilter from "../../components/report-filter";

const { Title, Text } = Typography;

export default function Page() {
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

  const handleClearFilters = useCallback(() => {
    setDateRange([dayjs().startOf("month"), dayjs()]);
    setSelectedOffice(null);
    setSearchText("");
  }, []);

  // Generate balance sheet data from filtered entries
  const { assets, liabilities, equity, netIncome } =
    journalStatus === "success"
      ? generateBalanceSheet(filteredEntries)
      : { assets: 0, liabilities: 0, equity: 0, netIncome: 0 };

  // Generate grouped data for Asset, Liability, and Equity from filtered entries
  const groupedAssets = useMemo(() => {
    return filteredEntries
      .filter((account) => account.glAccount.type.codeValue === "ASSET")
      .reduce<
        Record<string, { glCode: string; name: string; totalAmount: number }>
      >((acc, account) => {
        const { glCode, name } = account.glAccount;
        if (!acc[glCode]) {
          acc[glCode] = { glCode, name, totalAmount: 0 };
        }
        acc[glCode].totalAmount +=
          account.typeEnum === "DEBIT" ? account.amount : -account.amount;
        return acc;
      }, {});
  }, [filteredEntries]);

  const groupedLiabilities = useMemo(() => {
    return filteredEntries
      .filter((account) => account.glAccount.type.codeValue === "LIABILITY")
      .reduce<
        Record<string, { glCode: string; name: string; totalAmount: number }>
      >((acc, account) => {
        const { glCode, name } = account.glAccount;
        if (!acc[glCode]) {
          acc[glCode] = { glCode, name, totalAmount: 0 };
        }
        acc[glCode].totalAmount +=
          account.typeEnum === "CREDIT" ? account.amount : -account.amount;
        return acc;
      }, {});
  }, [filteredEntries]);

  const groupedEquities = useMemo(() => {
    return filteredEntries
      .filter((account) => account.glAccount.type.codeValue === "EQUITY")
      .reduce<
        Record<string, { glCode: string; name: string; totalAmount: number }>
      >((acc, account) => {
        const { glCode, name } = account.glAccount;
        if (!acc[glCode]) {
          acc[glCode] = { glCode, name, totalAmount: 0 };
        }
        acc[glCode].totalAmount +=
          account.typeEnum === "CREDIT" ? account.amount : -account.amount;
        return acc;
      }, {});
  }, [filteredEntries]);

  const assetColumns: ColumnType<any>[] = [
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
      render: (value: number, record) => (
        <Text
          strong={record.isNetIncome}
          className={value >= 0 ? "text-green-600" : "text-red-600"}
        >
          {value.toLocaleString("en-US", {
            style: "currency",
            currency: "UGX",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
      ),
      align: "right" as const,
    },
  ];

  const liabilityEquityColumns: ColumnType<any & { isNetIncome?: boolean }>[] =
    [
      {
        title: "Account Code",
        dataIndex: "glCode",
        key: "glCode",
        width: "25%",
        render: (value: string, record) => (record.isNetIncome ? "" : value),
      },
      {
        title: "Account Name",
        dataIndex: "name",
        key: "name",
        width: "45%",
        render: (value: string, record) =>
          record.isNetIncome ? <Text strong>{value}</Text> : value,
      },
      {
        title: "Amount",
        dataIndex: "totalAmount",
        key: "totalAmount",
        render: (value: number, record) => (
          <Text
            strong={record.isNetIncome}
            className={value >= 0 ? "text-green-600" : "text-red-600"}
          >
            {value.toLocaleString("en-US", {
              style: "currency",
              currency: "UGX",
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
        ),
        align: "right" as const,
        width: "30%",
      },
    ];

  const equityData = useMemo(
    () => [
      ...Object.values(groupedEquities),
      {
        glCode: "NET_INCOME",
        name: netIncome >= 0 ? "Net Income" : "Net Loss",
        totalAmount: netIncome,
        isNetIncome: true,
      },
    ],
    [groupedEquities, netIncome]
  );

  if (journalStatus === "pending" || officesStatus === "pending") {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (journalStatus === "error") {
    return (
      <div className="p-4 bg-red-50 rounded-lg">
        <Text type="danger">
          Error loading journal entries: {journalError?.message}
        </Text>
      </div>
    );
  }

  return (
    <div className="mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <Title level={2} className="!mb-0">
          Balance Sheet
        </Title>
        <div className="text-sm text-gray-500">
          <strong>Period: </strong>
          {dateRange[0].format("D MMM, YYYY")}
          {" - "}
          {dateRange[1].format("D MMM, YYYY")}
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card
          title={<span className="font-semibold text-lg">Assets</span>}
          className="shadow-lg"
          headStyle={{
            backgroundColor: "#1677ff10",
            borderBottom: "2px solid #1677ff",
            color: "#1677ff",
          }}
        >
          <Table
            columns={assetColumns}
            dataSource={Object.values(groupedAssets)}
            pagination={false}
            size="middle"
            bordered
            rowKey="glCode"
            footer={() => (
              <div className="flex justify-between font-semibold">
                <span>Total Assets</span>
                <span>
                  {assets.toLocaleString("en-US", {
                    style: "currency",
                    currency: "UGX",
                  })}
                </span>
              </div>
            )}
          />
        </Card>

        <div className="space-y-6">
          <LiabilitiesEquityCard
            type="Liabilities"
            liabilityEquityColumns={liabilityEquityColumns}
            data={groupedLiabilities}
            liabilities={liabilities}
          />

          <LiabilitiesEquityCard
            type="Equity"
            liabilityEquityColumns={liabilityEquityColumns}
            data={Object.fromEntries(
              equityData.map((item) => [item.glCode, item])
            )}
            liabilities={equity}
          />
        </div>
      </div>
    </div>
  );
}
