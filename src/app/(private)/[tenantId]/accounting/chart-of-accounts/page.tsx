"use client";

import { useGet } from "@/api";
import Alert_ from "@/components/alert";
import CreateModal from "@/components/create.modal";
import PageHeader from "@/components/page-header";
import { GLAccount } from "@/types";
import pluralize from "pluralize";
import {
  CREATE_MODAL_WIDTH,
  createPermissions,
  ENDPOINT,
  PAGE_TITLE,
  QUERY_KEY,
  readPermissions,
} from "./constants";
import CreateForm from "./create.form";
import DataTable from "./data-table";
import GLAccountByTypeCollapseView from "./data-tree-view";
import AccessDenied from "@/components/access-denied";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Button, Skeleton } from "antd";
import { useRoles } from "@/providers/RolesProvider";
import { hasPermission } from "@/utils/permissions";

export default function ChartOfAccountsPage() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTreeView, setIsTreeView] = useState(false);

  const {
    permissions,
    error: permissionsError,
    isPermissionsLoading,
  } = useRoles();

  const canCreate = hasPermission(permissions, createPermissions);
  const canRead = hasPermission(permissions, readPermissions);

  const {
    status,
    data: chartOfAccounts,
    error,
  } = useGet<GLAccount[]>(
    tenantId ? `${tenantId}/${ENDPOINT}` : "",
    tenantId ? [`${tenantId}/${QUERY_KEY}`] : []
    // avoids firing before tenantId is available
  );

  const toggleView = () => setIsTreeView((prev) => !prev);

  if (isPermissionsLoading || status === "pending") return <Skeleton />;

  if (permissionsError)
    return (
      <Alert_
        message="Permissions Error"
        description={permissionsError.toString()}
        type="error"
      />
    );

  if (!canRead) return <AccessDenied />;

  return (
    <div>
      <PageHeader
        pageTitle={pluralize(PAGE_TITLE)}
        extra={
          <Button onClick={toggleView}>
            {isTreeView ? "Table View" : "Tree View"}
          </Button>
        }
        createModal={
          canCreate && (
            <CreateModal
              pageTitle="GL Account"
              isModalOpen={isModalOpen}
              setIsModalOpen={setIsModalOpen}
              CreateForm={<CreateForm setIsModalOpen={setIsModalOpen} />}
              submitType="create"
              width={CREATE_MODAL_WIDTH}
            />
          )
        }
      />

      {status === "error" ? (
        <Alert_
          message="Error Fetching Accounts"
          description={error?.toString() ?? "Unknown error"}
          type="error"
        />
      ) : isTreeView ? (
        <GLAccountByTypeCollapseView
          data={chartOfAccounts ?? []}
          loading={status !== "success"}
        />
      ) : (
        <DataTable
          data={chartOfAccounts ?? []}
          loading={status !== "success"}
        />
      )}
    </div>
  );
}
