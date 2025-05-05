"use client";
import React, { useState } from "react";
import { useGetById } from "@/api";
import { Template } from "@/types";
import Alert_ from "@/components/alert";
import "@/components/css/Table.css";
import { useParams } from "next/navigation";
import CreateForm from "../create.form";
import { Skeleton, Typography } from "antd";
import { useRoles } from "@/providers/RolesProvider";
import { hasPermission } from "@/utils/permissions";
import RecordActions from "@/components/record-actions";
import AccessDenied from "@/components/access-denied";
import {
  deletePermissions,
  readPermissions,
  updatePermissions,
} from "../constants";
const { Title } = Typography;

export default function Page() {
  const { tenantId, templateId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    permissions,
    error: permissionsError,
    isPermissionsLoading,
  } = useRoles();

  const canUpdate = hasPermission(permissions, updatePermissions);
  const canRead = hasPermission(permissions, readPermissions);
  const canDelete = hasPermission(permissions, deletePermissions);

  const {
    status: templateStatus,
    data: template,
    error: templateError,
  } = useGetById<Template>(`${tenantId}/templates`, `${templateId}`);

  if (templateStatus === "error") {
    return (
      <Alert_
        message={"Error"}
        description={templateError.message}
        type={"error"}
      />
    );
  }

  if (templateStatus === "pending" || isPermissionsLoading) {
    return <Skeleton />;
  }

  if (permissionsError)
    return (
      <Alert_ message="Error" description={permissionsError} type="error" />
    );

  if (templateStatus === "success" && template) {
    return (
      <>
        {canRead ? (
          <>
            <div className="flex justify-between">
              <Title level={4}>Template</Title>
              <RecordActions
                actionTitle="template"
                isModalOpen={isModalOpen}
                redirectUrl={`/${tenantId}/system/templates`}
                setIsModalOpen={setIsModalOpen}
                canUpdate={canUpdate}
                canDelete={canDelete}
                id={Number(templateId)}
                deleteUrl={`${tenantId}/templates`}
                modalWidth={1000}
                updateForm={
                  <CreateForm
                    id={Number(templateId)}
                    submitType="update"
                    setIsModalOpen={setIsModalOpen}
                  />
                }
              />
            </div>

            <div className=" w-full">
              <table className="text-md text-left w-full">
                <tr className="text-lg">
                  <th className="w-[15rem]">Name:</th>
                  <td>{template.name}</td>
                </tr>
                <tr className="text-md">
                  <th>Type:</th>
                  <td>{template.type}</td>
                </tr>
                <tr className="text-md">
                  <th>Entity:</th>
                  <td>{template.entity}</td>
                </tr>
                <tr className="text-md">
                  <th>Is Active:</th>
                  <td>{template.isActive ? "Yes" : "No"}</td>
                </tr>
                <tr className="text-md">
                  <th>Content:</th>
                  <td
                    className=""
                    dangerouslySetInnerHTML={{ __html: template.content }}
                  />
                </tr>
              </table>
            </div>
          </>
        ) : (
          <AccessDenied />
        )}
      </>
    );
  }

  return null;
}
