"use client";

import { useGet } from "@/api";
import {
  Loan,
  MySession,
  SavingsAccount,
  ShareAccount,
  Tenant,
  UserTenant,
} from "@/types";
import Link from "next/link";
import { useParams } from "next/navigation";

import { Card, Row, Col, Table, Tag, Progress, Select, Skeleton } from "antd";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  UserOutlined,
  MoneyCollectOutlined,
  BankOutlined,
  SafetyOutlined,
  StarOutlined,
  WarningOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";
import Alert_ from "@/components/alert";
import { formatLargeNumber } from "@/utils/numbers";

export default function NonSuperDashboard(props: {
  mySession: MySession | null;
  tenant: Tenant;
}) {
  const { mySession, tenant } = props;

  const { tenantId } = useParams();
  const {
    status: tenantsStatus,
    data: tenants,
    error: userTenantsError,
  } = useGet<Tenant[]>(`${tenantId}/users/${mySession?.user.userId}/tenants`, [
    `${tenantId}/users/${mySession?.user.userId}/tenants`,
  ]);

  const {
    status: clientCountStatus,
    data: clientCount,
    error: clientCountError,
  } = useGet<any>(`${tenantId}/clients/count?where={"tenantId":${tenantId}}`, [
    `${tenantId}/clients/count`,
  ]);

  const {
    status: groupCountStatus,
    data: groupCount,
    error: groupCountError,
  } = useGet<any>(`${tenantId}/groups/count?where={"tenantId":${tenantId}}`, [
    `${tenantId}/groups/count`,
  ]);

  const {
    status: loansStatus,
    data: loans,
    error: loansError,
  } = useGet<Loan[]>(
    `${tenantId}/loans/?filter={"where":{"loanStatusEnum":"ACTIVE","tenantId":${tenantId}}}`,
    [`${tenantId}/loans`]
  );

  const {
    status: savingsAccountsStatus,
    data: savingsAccounts,
    error: savingsAccountError,
  } = useGet<SavingsAccount[]>(
    `${tenantId}/savings-accounts/?filter={"where":{"statusEnum":"ACTIVE"}}`,
    [`${tenantId}/savings-accounts`]
  );

  const {
    status: shareAccountsStatus,
    data: shareAccounts,
    error: shareAccountError,
  } = useGet<ShareAccount[]>(
    `${tenantId}/share-accounts/?filter={"where":{"statusEnum":"ACTIVE"}}`,
    [`${tenantId}/share-accounts`]
  );

  let totalLoanPortfolio = 0;

  if (loansStatus === "success" && Array.isArray(loans)) {
    totalLoanPortfolio = loans.reduce((sum, loan) => {
      // Ensure loan.totalOutstandingDerived is a valid number
      const loanAmount =
        typeof loan.totalOutstandingDerived === "number"
          ? loan.totalOutstandingDerived
          : 0;
      return sum + loanAmount;
    }, 0);
  }

  let totalSavingsPortfolio = 0;

  if (savingsAccountsStatus === "success" && Array.isArray(savingsAccounts)) {
    totalSavingsPortfolio = savingsAccounts.reduce((sum, savingsAccount) => {
      const savingsAccountAmount =
        typeof savingsAccount.accountBalanceDerived === "number"
          ? savingsAccount.accountBalanceDerived
          : 0;
      return sum + savingsAccountAmount;
    }, 0);
  }

  let totalSharePortfolio = 0;

  if (shareAccountsStatus === "success" && Array.isArray(shareAccounts)) {
    totalSharePortfolio = shareAccounts.reduce((sum, shareAccount) => {
      const shareAccountAmount =
        typeof (
          shareAccount.totalApprovedShares *
          Number(shareAccount.shareProduct.unitPrice)
        ) === "number"
          ? shareAccount.totalApprovedShares *
            Number(shareAccount.shareProduct.unitPrice)
          : 0;
      return sum + shareAccountAmount;
    }, 0);
  }

  // Sample data - replace with real API data
  const summaryData = [
    {
      title: "Total Clients",
      value:
        clientCountStatus === "pending" ? (
          <Skeleton.Avatar active={true} />
        ) : clientCountStatus === "success" ? (
          Number(clientCount.count)
        ) : (
          <Alert_
            type="error"
            message="Error"
            description={"There has been an error"}
          />
        ),
      change: 12.5,
      icon: <UserOutlined />,
    },
    {
      title: "Total Groups",
      value:
        groupCountStatus === "pending" ? (
          <Skeleton.Avatar active={true} />
        ) : groupCountStatus === "success" ? (
          Number(groupCount.count)
        ) : (
          <Alert_
            type="error"
            message="Error"
            description={"There has been an error"}
          />
        ),
      change: 12.5,
      icon: <UsergroupAddOutlined />,
    },
    {
      title: "Loan Portfolio",
      value:
        loansStatus === "pending" ? (
          <Skeleton.Avatar active={true} />
        ) : loansStatus === "success" ? (
          `UGX ${formatLargeNumber(totalLoanPortfolio)}`
        ) : (
          <Alert_
            type="error"
            message="Error"
            description={"There has been an error"}
          />
        ),
      change: 8.2,
      icon: <MoneyCollectOutlined />,
    },
    {
      title: "Savings Portfolio",
      value:
        savingsAccountsStatus === "pending" ? (
          <Skeleton.Avatar active={true} />
        ) : savingsAccountsStatus === "success" ? (
          `UGX ${formatLargeNumber(totalSavingsPortfolio)}`
        ) : (
          <Alert_
            type="error"
            message="Error"
            description={"There has been an error"}
          />
        ),
      change: 5.7,
      icon: <BankOutlined />,
    },
    {
      title: "Share Capital",
      value:
        shareAccountsStatus === "pending" ? (
          <Skeleton.Avatar active={true} />
        ) : shareAccountsStatus === "success" ? (
          `UGX ${formatLargeNumber(totalSharePortfolio)}`
        ) : (
          <Alert_
            type="error"
            message="Error"
            description={"There has been an error"}
          />
        ),
      change: 3.4,
      icon: <SafetyOutlined />,
    },
  ];

  const {
    status: loanDisbursementStatus,
    data: loanDisbursement,
    error: loanDisbursementError,
  } = useGet<{ name: string; amount: number }[]>(
    `${tenantId}/loans/disbursement-summary`,
    [`${tenantId}/loans/disbursement-summary`]
  );

  let loanDisbursementData;

  if (loanDisbursementStatus === "success") {
    loanDisbursementData = loanDisbursement;
  }

  const {
    status: parStatus,
    data: par,
    error: parError,
  } = useGet<number>(`${tenantId}/portfolio-at-risk`, [
    `${tenantId}/portfolio-at-risk`,
  ]);

  let parData = 0;

  if (parStatus === "success") {
    parData = par;
  }

  const portfolioAtRiskData = [
    { name: "Loans", value: parData },
    { name: "Savings", value: 2.3 },
    { name: "Share Capital", value: 1.7 },
  ];

  const {
    status: branchPerformanceStatus,
    data: branchPerformance,
    error: branchPerformanceError,
  } = useGet<any[]>(`${tenantId}/branches/performance`, [
    `/${tenantId}/branches/performance`,
  ]);

  let branchPerformanceData = [];
  if (branchPerformanceStatus === "success") {
    console.log("branchPerformance", branchPerformance);
    branchPerformanceData = branchPerformance;
  }

  // const branchPerformanceData = [
  //   { name: "Main Branch", loans: 12000, savings: 8000, risk: 5.2 },
  //   { name: "North Branch", loans: 9800, savings: 6500, risk: 7.8 },
  //   { name: "East Branch", loans: 15000, savings: 9200, risk: 3.5 },
  //   { name: "West Branch", loans: 7500, savings: 4200, risk: 9.1 },
  //   { name: "South Branch", loans: 11000, savings: 7800, risk: 6.4 },
  // ];

  const COLORS = ["#cf1322", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <div className="col-span-12">
      {!mySession?.user.roles?.includes("super") &&
        tenantsStatus === "success" &&
        tenants?.length > 1 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 mb-5 gap-3">
            {tenants.map((tenant) => (
              <Link
                key={tenant.id}
                href={`${tenant.id}`}
                passHref
                legacyBehavior
              >
                <a>
                  <Card
                    size="small"
                    className={`
                      shadow-lg w-full transition-colors
                      ${
                        tenant.id === Number(tenantId)
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 hover:bg-gray-200"
                      }
                    `}
                  >
                    <p className="truncate">{tenant.name}</p>
                  </Card>
                </a>
              </Link>
            ))}
          </div>
        )}

      <div className="min-h-screen">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            Dashboard
          </h1>
          {/* <Select defaultValue="2023" style={{ width: 120 }}>
              <Select.Option value="2023">2023</Select.Option>
              <Select.Option value="2022">2022</Select.Option>
              <Select.Option value="2021">2021</Select.Option>
            </Select> */}
        </div>

        {/* Summary Cards - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 mb-3">
          {summaryData.map((item, index) => (
            <div key={index}>
              <Card className="h-full shadow-lg">
                <div className="flex justify-between">
                  <div>
                    <p className="text-gray-500 text-sm sm:text-base">
                      {item.title}
                    </p>
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold my-1 sm:my-2">
                      {item.value}
                    </h3>
                    <div
                      className={`flex items-center text-xs sm:text-sm ${
                        item.change > 0 ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {item.change > 0 ? (
                        <ArrowUpOutlined />
                      ) : (
                        <ArrowDownOutlined />
                      )}
                      <span className="ml-1">
                        {Math.abs(item.change)}% from last month
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-blue-100 text-blue-600 text-lg sm:text-xl">
                    {item.icon}
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>

        {/* Charts Row 1 - Stack on mobile */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="w-full lg:w-1/2">
            <Card title="Loan Disbursement Trend" className="h-full shadow-lg">
              <div className="h-[250px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={loanDisbursementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <YAxis
                      tickFormatter={(value) => formatLargeNumber(value)}
                    />
                    <XAxis dataKey="name" />
                    <Tooltip
                      formatter={(value) => [
                        formatLargeNumber(Number(value)),
                        "Amount",
                      ]}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#8884d8"
                      fill="#8884d8"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
          <div className="w-full lg:w-1/2">
            <Card title="Portfolio at Risk" className="h-full shadow-lg">
              <div className="h-[250px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={portfolioAtRiskData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {portfolioAtRiskData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Tag color="red">Loans: {parData.toFixed(2)}%</Tag>
                <Tag color="orange">Savings: 2.3%</Tag>
                <Tag color="green">Share Capital: 1.7%</Tag>
              </div>
            </Card>
          </div>
        </div>

        {/* Branch Performance - Full width */}
        <Card title="Branch Performance" className="mb-6 shadow-lg">
          <div className="h-[250px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="loans"
                  name="Loans (UGX)"
                  fill="#8884d8"
                />
                <Bar
                  yAxisId="right"
                  dataKey="savings"
                  name="Savings (UGX)"
                  fill="#82ca9d"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Best/Worst Performing Branches - Stack on mobile */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="w-full lg:w-1/2">
            <Card
              title={
                <span className="flex items-center">
                  <StarOutlined className="text-yellow-500 mr-2" />
                  Best Performing Branch
                </span>
              }
              className="h-full shadow-lg"
            >
              <div className="text-center">
                <h3 className="text-lg sm:text-xl font-bold">East Branch</h3>
                <p className="text-gray-500 text-sm sm:text-base">
                  Loan Portfolio: UGX15,000
                </p>
                <p className="text-gray-500 text-sm sm:text-base">
                  Savings: UGX9,200
                </p>
                <Tag color="green" className="mt-2">
                  Risk: 3.5%
                </Tag>
                <Progress
                  percent={96.5}
                  status="active"
                  className="mt-4"
                  strokeWidth={10}
                />
              </div>
            </Card>
          </div>
          <div className="w-full lg:w-1/2">
            <Card
              title={
                <span className="flex items-center">
                  <WarningOutlined className="text-red-500 mr-2" />
                  Worst Performing Branch
                </span>
              }
              className="h-full shadow-lg"
            >
              <div className="text-center">
                <h3 className="text-lg sm:text-xl font-bold">West Branch</h3>
                <p className="text-gray-500 text-sm sm:text-base">
                  Loan Portfolio: UGX7,500
                </p>
                <p className="text-gray-500 text-sm sm:text-base">
                  Savings: UGX4,200
                </p>
                <Tag color="red" className="mt-2">
                  Risk: 9.1%
                </Tag>
                <Progress
                  percent={90.9}
                  status="exception"
                  className="mt-4"
                  strokeWidth={10}
                />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
