"use client";
import { useGet } from "@/api";
import Alert_ from "@/components/alert";
import PageHeader from "@/components/page-header";
import { ENDPOINT, QUERY_KEY, readPermissions } from "./constants";
import DataTable from "./data-table";
import { useParams } from "next/navigation";
import { Card, Col, Row, Skeleton, Statistic, Tag } from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  MessageOutlined,
  BulbOutlined,
  QuestionOutlined,
  WarningOutlined,
  FormOutlined,
} from "@ant-design/icons";

import { SupportTicket } from "@/types";
import dayjs from "dayjs";
import { formatDuration } from "@/utils/dates";
import Link from "next/link";
import { useRoles } from "@/providers/RolesProvider";
import { hasPermission } from "@/utils/permissions";

export default function SupportDashboard() {
  const { tenantId } = useParams();

  const { permissions } = useRoles();

  const canReadAll = hasPermission(permissions, readPermissions);

  // Helper function to build the filter based on permissions
  const buildFilter = (baseQuery: string, isCount = false) => {
    if (canReadAll) return baseQuery;

    const userCondition = {
      and: [{ tenantId }],
    };

    if (!baseQuery) {
      if (isCount) {
        // Empty base, but it's a count -> return ?where=
        return `?where=${JSON.stringify(userCondition)}`;
      }
      // Empty base, normal list -> return ?filter={"where":}
      return `?filter={"where":${JSON.stringify(userCondition)}}`;
    }

    if (baseQuery.startsWith("?filter=")) {
      const existingFilter = JSON.parse(baseQuery.slice(8));
      if (existingFilter.where) {
        existingFilter.where = {
          and: [userCondition, existingFilter.where],
        };
      } else {
        existingFilter.where = userCondition;
      }
      return `?filter=${JSON.stringify(existingFilter)}`;
    }

    if (baseQuery.startsWith("?where=")) {
      const existingWhere = JSON.parse(baseQuery.slice(7));
      const combinedWhere = {
        and: [userCondition, existingWhere],
      };
      return `?where=${JSON.stringify(combinedWhere)}`;
    }

    return baseQuery;
  };

  // Tickets list query
  const {
    status,
    data: tickets,
    error,
  } = useGet<SupportTicket[]>(
    `${tenantId}/${ENDPOINT}${buildFilter(`?filter={"order":["id DESC"]}`)}`,
    [`${tenantId}/${QUERY_KEY}`]
  );

  // Count queries
  const {
    status: totalCountStatus,
    data: total,
    error: totalCountError,
  } = useGet<SupportTicket>(
    `${tenantId}/${ENDPOINT}/count${buildFilter("", true)}`, // <-- Pass `true` for isCount
    [`${tenantId}/${QUERY_KEY}/count/total`]
  );

  const { status: openCountStatus, data: openCount } = useGet<SupportTicket>(
    `${tenantId}/${ENDPOINT}/count${buildFilter(`?where={"status":"open"}`)}`,
    [`${tenantId}/${QUERY_KEY}/count/open`]
  );

  const {
    status: inProgressCountStatus,
    data: inProgressCount,
    error: inProgressError,
  } = useGet<SupportTicket>(
    `${tenantId}/${ENDPOINT}/count${buildFilter(
      `?where={"status":"in_progress"}`
    )}`,
    [`${tenantId}/${QUERY_KEY}/count/inProgress`]
  );

  const {
    status: resolvedCountStatus,
    data: resolvedCount,
    error: resolvedCountError,
  } = useGet<SupportTicket>(
    `${tenantId}/${ENDPOINT}/count${buildFilter(
      `?where={"status":"resolved"}`
    )}`,
    [`${tenantId}/${QUERY_KEY}/count/resolved`]
  );

  const { status: issuedCountStatus, data: issuedCount } =
    useGet<SupportTicket>(
      `${tenantId}/${ENDPOINT}/count${buildFilter(`?where={"type":"issue"}`)}`,
      [`${tenantId}/${QUERY_KEY}/count/issue`]
    );

  const { status: feedbackCountStatus, data: feedbackCount } =
    useGet<SupportTicket>(
      `${tenantId}/${ENDPOINT}/count${buildFilter(
        `?where={"type":"feedback"}`
      )}`,
      [`${tenantId}/${QUERY_KEY}/count/feedback`]
    );

  const { status: questionsCountStatus, data: questionsCount } =
    useGet<SupportTicket>(
      `${tenantId}/${ENDPOINT}/count${buildFilter(
        `?where={"type":"question"}`
      )}`,
      [`${tenantId}/${QUERY_KEY}/count/question`]
    );

  const { status: featureRequestsCountStatus, data: featureRequestsCount } =
    useGet<SupportTicket>(
      `${tenantId}/${ENDPOINT}/count${buildFilter(
        `?where={"type":"feature_request"}`
      )}`,
      [`${tenantId}/${QUERY_KEY}/count/feature_request`]
    );

  const {
    status: closedCountStatus,
    data: closedCount,
    error: closedCountError,
  } = useGet<SupportTicket>(
    `${tenantId}/${ENDPOINT}/count${buildFilter(`?where={"status":"closed"}`)}`,
    [`${tenantId}/${QUERY_KEY}/count/closed`]
  );

  const { status: recentActivityStatus, data: recentActivity } = useGet<
    SupportTicket[]
  >(
    `${tenantId}/${ENDPOINT}${buildFilter(
      `?filter={"order":["updatedAt DESC"],"limit":3}`
    )}`,
    [`${tenantId}/${QUERY_KEY}?filter={"order":["updatedAt DESC"],"limit":3}`]
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "blue";
      case "in_progress":
        return "orange";
      case "resolved":
        return "green";
      case "closed":
        return "gray";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 px-2 md:px-0">
      <PageHeader pageTitle="Support Dashboard" />

      {status === "error" ? (
        <Alert_ message={"Error"} description={error} type={"error"} />
      ) : (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-2 md:gap-3">
            <Card
              title="Total Tickets"
              size="small"
              className="col-span-2 md:col-span-1 lg:col-span-2 shadow-lg"
            >
              {totalCountStatus === "error" ? (
                <Alert_
                  type="error"
                  description={totalCountError?.message}
                  message="Error"
                />
              ) : totalCountStatus === "pending" ? (
                <Skeleton.Avatar active={true} />
              ) : (
                <Statistic value={total?.count} prefix={<MessageOutlined />} />
              )}
            </Card>

            <Card
              title="Open"
              size="small"
              className="col-span-1 md:col-span-1 lg:col-span-2 shadow-lg"
            >
              {openCountStatus === "error" ? (
                <Alert_
                  type="error"
                  description={totalCountError?.message}
                  message="Error"
                />
              ) : openCountStatus === "pending" ? (
                <Skeleton.Avatar active={true} />
              ) : (
                <Statistic
                  value={openCount?.count}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: "#1890ff" }}
                />
              )}
            </Card>

            <Card
              title="Progress"
              size="small"
              className="col-span-1 md:col-span-1 lg:col-span-2 shadow-lg"
            >
              {inProgressCountStatus === "error" ? (
                <Alert_
                  type="error"
                  description={inProgressError?.message}
                  message="Error"
                />
              ) : inProgressCountStatus === "pending" ? (
                <Skeleton.Avatar active={true} />
              ) : (
                <Statistic
                  value={inProgressCount?.count}
                  prefix={
                    <SyncOutlined
                      spin={(inProgressCount?.count ?? 0) > 0 ? true : false}
                    />
                  }
                  valueStyle={{ color: "#fa8c16" }}
                />
              )}
            </Card>

            <Card
              title="Resolved"
              size="small"
              className="col-span-1 md:col-span-1 lg:col-span-2 shadow-lg"
            >
              {resolvedCountStatus === "error" ? (
                <Alert_
                  type="error"
                  description={resolvedCountError?.message}
                  message="Error"
                />
              ) : resolvedCountStatus === "pending" ? (
                <Skeleton.Avatar active={true} />
              ) : (
                <Statistic
                  value={resolvedCount?.count}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: "#52c41a" }}
                />
              )}
            </Card>

            <Card
              title="Closed"
              size="small"
              className="col-span-1 md:col-span-1 lg:col-span-2 shadow-lg"
            >
              {closedCountStatus === "error" ? (
                <Alert_
                  type="error"
                  description={closedCountError?.message}
                  message="Error"
                />
              ) : closedCountStatus === "pending" ? (
                <Skeleton.Avatar active={true} />
              ) : (
                <Statistic
                  value={closedCount?.count}
                  prefix={<CloseCircleOutlined />}
                  valueStyle={{ color: "#8c8c8c" }}
                />
              )}
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="col-span-1">
              <div className="grid grid-cols-2 gap-2 md:gap-3">
                <Card className="col-span-1 bg-red-300">
                  <Statistic
                    title="Issues"
                    value={
                      issuedCountStatus === "pending" ? 0 : issuedCount?.count
                    }
                    prefix={<WarningOutlined />}
                  />
                </Card>

                <Card className="col-span-1 bg-purple-300">
                  <Statistic
                    title="Feedback"
                    value={
                      feedbackCountStatus === "pending"
                        ? 0
                        : feedbackCount?.count
                    }
                    prefix={<FormOutlined />}
                  />
                </Card>

                <Card className="col-span-1 bg-blue-300">
                  <Statistic
                    title="Questions"
                    value={
                      questionsCountStatus === "pending"
                        ? 0
                        : questionsCount?.count
                    }
                    prefix={<QuestionOutlined />}
                  />
                </Card>

                <Card className="col-span-1 bg-green-300">
                  <Statistic
                    title="Feature Requests"
                    value={
                      featureRequestsCountStatus === "pending"
                        ? 0
                        : featureRequestsCount?.count
                    }
                    prefix={<BulbOutlined />}
                  />
                </Card>
              </div>
            </div>

            <div className="col-span-1 mt-3 md:mt-0">
              {/* Ticket Types Overview */}
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={24} md={24}>
                  <Card title="Recent Activity" className="shadow-lg ">
                    <div className="space-y-4">
                      {recentActivityStatus === "pending" ? (
                        <Skeleton active={true} />
                      ) : (
                        recentActivityStatus === "success" &&
                        recentActivity &&
                        recentActivity.map((ticket) => (
                          <div
                            key={ticket.id}
                            className="border-b pb-2 last:border-0 "
                          >
                            <Link
                              href={`/${tenantId}/support/${ticket.id}`}
                              key={ticket.id}
                            >
                              <div className="flex justify-between">
                                <span className="font-medium">
                                  {ticket.title}
                                </span>
                                <div className="flex items-center gap-2">
                                  <Tag color={getStatusColor(ticket.status)}>
                                    {ticket.status
                                      .split("_")
                                      .map(
                                        (w) =>
                                          w.charAt(0).toUpperCase() + w.slice(1)
                                      )
                                      .join(" ")}
                                  </Tag>

                                  <div>
                                    {(() => {
                                      const updatedAt = dayjs(ticket.updatedAt);
                                      const now = dayjs();
                                      const duration = now.diff(
                                        updatedAt,
                                        "milliseconds"
                                      );
                                      return `${formatDuration(duration)}`;
                                    })()}
                                  </div>
                                </div>
                              </div>
                            </Link>
                          </div>
                        ))
                      )}
                    </div>
                  </Card>
                </Col>
              </Row>
            </div>
          </div>

          {/* Full Tickets Table */}
          <Card
            title="All Support Tickets"
            extra={
              <Tag icon={<BulbOutlined />} color="blue">
                Showing {tickets?.length || 0} tickets
              </Tag>
            }
          >
            <div style={{ overflowX: "auto" }}>
              <DataTable data={tickets || []} loading={status === "pending"} />
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
