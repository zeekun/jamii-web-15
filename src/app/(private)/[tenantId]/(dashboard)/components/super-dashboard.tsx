"use client";
import { Card, Statistic, Skeleton, Select, Tag } from "antd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { useGet } from "@/api";
import { useParams } from "next/navigation";
import Alert_ from "@/components/alert";
import { ArrowUpOutlined } from "@ant-design/icons";
import Link from "next/link";
import { LoginActivity, TenantActivity } from "@/types";
import { useState } from "react";

const SuperDashboard = () => {
  const { tenantId } = useParams();
  const [loginActivityDateRange, setLoginActivityDateRange] =
    useState<string>("1month");
  const [tenantActivityDateRange, setTenantActivityDateRange] =
    useState<string>("1month");

  // API Queries
  const {
    status: tenantCountStatus,
    data: tenantCount,
    error: tenantCountError,
  } = useGet<{ count: number }>(`${tenantId}/tenants/count`, [
    `${tenantId}/tenants/count`,
  ]);

  const {
    status: userCountStatus,
    data: userCount,
    error: userCountError,
  } = useGet<{ count: number }>(`${tenantId}/users/count`, [
    `${tenantId}/users/count`,
  ]);

  const {
    status: loginActivityStatus,
    data: loginActivity,
    error: loginActivityError,
  } = useGet<LoginActivity[]>(
    `${tenantId}/login-activity?range=${loginActivityDateRange}`,
    [`${tenantId}/login-activity`, loginActivityDateRange]
  );

  const {
    status: tenantActivityStatus,
    data: tenantActivity,
    error: tenantActivityError,
  } = useGet<TenantActivity[]>(
    `${tenantId}/tenant-activity?range=${tenantActivityDateRange}`,
    [`${tenantId}/tenant-activity`, tenantActivityDateRange]
  );

  // Calculate metrics
  const averageUsersPerTenant =
    tenantCount?.count && userCount?.count
      ? (userCount.count / tenantCount.count).toFixed(1)
      : 0;

  const totalFailedLogins =
    loginActivity?.reduce((acc, curr) => acc + curr.failedLogins, 0) || 0;

  const mostActiveTenant = tenantActivity?.reduce((prev, curr) =>
    prev.logins > curr.logins ? prev : curr
  );

  const leastActiveTenant = tenantActivity?.reduce((prev, curr) =>
    prev.logins < curr.logins ? prev : curr
  );

  // Limit to top 6 tenants by logins
  const limitedTenantActivity = tenantActivity
    ? [...tenantActivity].sort((a, b) => b.logins - a.logins).slice(0, 6)
    : [];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-6">
        <Link href={`/${tenantId}/tenants`}>
          <Card title="Total Tenants" size="small" className="shadow-xl">
            {tenantCountStatus === "error" ? (
              <Alert_
                type="error"
                description={tenantCountError?.message}
                message="Error"
              />
            ) : tenantCountStatus === "pending" ? (
              <Skeleton.Avatar active={true} />
            ) : (
              <Statistic
                value={tenantCount?.count}
                prefix={<ArrowUpOutlined />}
                valueStyle={{ color: "#3f8600" }}
              />
            )}
          </Card>
        </Link>

        <Link href={`/${tenantId}/users`}>
          <Card title="Total System Users" className="shadow-xl" size="small">
            {userCountStatus === "error" ? (
              <Alert_
                type="error"
                description={userCountError?.message}
                message="Error"
              />
            ) : userCountStatus === "pending" ? (
              <Skeleton.Avatar active={true} />
            ) : (
              <Statistic
                value={userCount?.count}
                prefix={<ArrowUpOutlined />}
                valueStyle={{ color: "#3f8600" }}
              />
            )}
          </Card>
        </Link>

        <Card title="Avg Users/Tenant" className="shadow-lg" size="small">
          <Statistic value={averageUsersPerTenant} />
        </Card>

        <Card title="Failed Logins" className="shadow-lg" size="small">
          <Statistic value={totalFailedLogins} />
        </Card>

        <Card
          title={
            <div className="flex gap-2 justify-between">
              Most Active
              <Tag color="green">
                {mostActiveTenant ? mostActiveTenant.logins : 0} logins
              </Tag>
            </div>
          }
          className="shadow-lg"
          size="small"
        >
          {mostActiveTenant ? (
            <div>
              <div className="font-medium truncate">
                {mostActiveTenant.name}
              </div>
            </div>
          ) : (
            <Statistic value="N/A" />
          )}
        </Card>

        <Card
          title={
            <div className="flex gap-2 justify-between">
              Least Active
              <Tag color="volcano">
                {leastActiveTenant ? leastActiveTenant.logins : 0} logins
              </Tag>
            </div>
          }
          className="shadow-lg"
          size="small"
        >
          {leastActiveTenant ? (
            <div>
              <div className="font-medium truncate">
                {leastActiveTenant.name}
              </div>
            </div>
          ) : (
            <Statistic value="N/A" />
          )}
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card
          title={
            <div className="flex justify-between items-center">
              <span>Login Activity</span>
              <Select
                value={loginActivityDateRange}
                style={{ width: 120 }}
                onChange={setLoginActivityDateRange}
                options={[
                  { value: "1week", label: "1 Week" },
                  { value: "2weeks", label: "2 Weeks" },
                  { value: "3weeks", label: "3 Weeks" },
                  { value: "1month", label: "1 Month" },
                ]}
              />
            </div>
          }
          className="shadow-lg"
        >
          <ResponsiveContainer width="100%" height={300}>
            {loginActivityStatus === "pending" ? (
              <Skeleton active />
            ) : loginActivityStatus === "error" ? (
              <Alert_
                type="error"
                description={loginActivityError?.message}
                message="Failed to load login activity"
              />
            ) : (
              <LineChart data={loginActivity}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="logins" stroke="#8884d8" />
                <Line type="monotone" dataKey="failedLogins" stroke="#ff7300" />
              </LineChart>
            )}
          </ResponsiveContainer>
        </Card>

        <Card
          title={
            <div className="flex justify-between items-center">
              <span>Top 6 Tenants by Activity</span>
              <Select
                value={tenantActivityDateRange}
                style={{ width: 120 }}
                onChange={setTenantActivityDateRange}
                options={[
                  { value: "1week", label: "1 Week" },
                  { value: "2weeks", label: "2 Weeks" },
                  { value: "3weeks", label: "3 Weeks" },
                  { value: "1month", label: "1 Month" },
                ]}
              />
            </div>
          }
          className="shadow-md"
        >
          <ResponsiveContainer width="100%" height={300}>
            {tenantActivityStatus === "pending" ? (
              <Skeleton active />
            ) : tenantActivityStatus === "error" ? (
              <Alert_
                type="error"
                description={tenantActivityError?.message}
                message="Failed to load tenant activity"
              />
            ) : (
              <BarChart data={limitedTenantActivity}>
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={70}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="activeUsers" fill="#82ca9d" name="Active Users" />
                <Bar dataKey="logins" fill="#8884d8" name="Logins" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

export default SuperDashboard;
