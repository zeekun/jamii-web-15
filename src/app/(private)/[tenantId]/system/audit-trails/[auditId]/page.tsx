"use client";
import React from "react";
import { useGetById } from "@/api";
import { AuditLog } from "@/types";
import Alert_ from "@/components/alert";
import "@/components/css/Table.css";
import { useParams } from "next/navigation";
import { Skeleton, Typography, Card, Tag, Divider } from "antd";
import { useRoles } from "@/providers/RolesProvider";
import { hasPermission } from "@/utils/permissions";
import AccessDenied from "@/components/access-denied";
import { readPermissions } from "../constants";
import { formattedDate } from "@/utils/dates";
const { Title, Text } = Typography;

export default function Page() {
  const { tenantId, auditId } = useParams();

  const {
    permissions,
    error: permissionsError,
    isPermissionsLoading,
  } = useRoles();

  const canRead = hasPermission(permissions, readPermissions);

  const {
    status: auditStatus,
    data: audit,
    error: auditError,
  } = useGetById<AuditLog>(`${tenantId}/audit-logs`, `${auditId}`);

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case "create":
        return "green";
      case "update":
        return "blue";
      case "delete":
        return "red";
      default:
        return "gray";
    }
  };

  /**
   * Safely parses JSON string into an object
   * Returns the original value if parsing fails or if value is not a string
   */
  const parseJsonIfString = (value: unknown): unknown => {
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  };

  /**
   * Checks if a value is an object (and not null)
   */
  const isObject = (value: unknown): value is Record<string, unknown> => {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  };

  /**
   * Render value table for audit log changes
   */
  const renderValueTable = (title: string, data: unknown) => {
    if (data === null || data === undefined) return null;

    const parsedData = parseJsonIfString(data);

    return (
      <Card title={title} style={{ marginBottom: 16 }}>
        {isObject(parsedData) ? (
          <table className="value-comparison-table">
            <thead>
              <tr>
                <th className="w-1/4">Field</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(parsedData).map(([key, value]) => (
                <tr key={key}>
                  <td className="field-name">{key}</td>
                  <td className="field-value">
                    {isObject(value) || Array.isArray(value)
                      ? JSON.stringify(value, null, 2)
                      : String(value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <Text>{String(parsedData)}</Text>
        )}
      </Card>
    );
  };

  const renderComparison = () => {
    if (!audit) return null;

    return (
      <div className="comparison-container">
        {audit.oldValue !== undefined &&
          renderValueTable("Previous Values", audit.oldValue)}
        {audit.newValue !== undefined &&
          renderValueTable("Current Values", audit.newValue)}
      </div>
    );
  };

  if (auditStatus === "error" && auditError) {
    return (
      <Alert_
        message={"Error"}
        description={
          auditError.message || "An error occurred while fetching audit data"
        }
        type={"error"}
      />
    );
  }

  if (auditStatus === "pending" || isPermissionsLoading) {
    return <Skeleton active />;
  }

  if (permissionsError)
    return (
      <Alert_ message="Error" description={permissionsError} type="error" />
    );

  if (auditStatus === "success" && audit) {
    return (
      <>
        {canRead ? (
          <div className="audit-detail-container">
            <div className="flex justify-between mb-6">
              <Title level={3}>Audit Trail</Title>
            </div>

            <Card title={"Details"} style={{ marginBottom: 16 }}>
              <table>
                <tbody>
                  <tr>
                    <th className="w-1/4">Action</th>
                    <td>
                      <Tag color={getActionColor(audit.action)}>
                        {audit.action.toUpperCase()}
                      </Tag>
                    </td>
                  </tr>
                  <tr>
                    <th>Entity</th>
                    <td>{audit.modelName}</td>
                  </tr>
                  <tr>
                    <th>Entity ID</th>
                    <td>{audit.entityId || "N/A"}</td>
                  </tr>
                  <tr>
                    <th>Performed By</th>
                    <td>
                      {`${audit.user?.person.firstName || ""} ${
                        audit.user?.person.middleName || ""
                      } ${audit.user?.person.lastName || ""}`}
                    </td>
                  </tr>
                  <tr>
                    <th>Timestamp</th>
                    <td>
                      {formattedDate(audit.timestamp, "H:m:s A, DD MMM YYYY")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </Card>

            {renderComparison()}
          </div>
        ) : (
          <AccessDenied />
        )}
      </>
    );
  }

  return null;
}
