"use client";
import { useDeleteV2, useGet } from "@/api";
import Alert_ from "@/components/alert";
import CreateModal from "@/components/create.modal";
import PageHeader from "@/components/page-header";
import { GroupRole } from "@/types";
import type { TableProps } from "antd";
import { Popconfirm, Table } from "antd";
import { useParams } from "next/navigation";
import { useState } from "react";
import CreateGroupRoleForm from "./create-group-role.form";
import MyButton from "@/components/my-button";
import { MinusOutlined } from "@ant-design/icons";
import toast from "@/utils/toast";
import { useRoles } from "@/providers/RolesProvider";
import { hasPermission } from "@/utils/permissions";
import {
  assignRoleGroupPermissions,
  unassignRoleGroupPermissions,
} from "../constants";

export default function GroupRolesDataTable() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { tenantId, groupId } = useParams();
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const {
    permissions,
    error: permissionsError,
    isPermissionsLoading,
  } = useRoles();

  const canAssignRoleGroup = hasPermission(
    permissions,
    assignRoleGroupPermissions
  );

  const canUnassignRoleGroup = hasPermission(
    permissions,
    unassignRoleGroupPermissions
  );

  const { data, status, error } = useGet<GroupRole[]>(
    `${tenantId}/groups/${groupId}/group-roles`,
    [`${tenantId}/groups/${groupId}/group-roles`]
  );

  const { mutate: unAssign } = useDeleteV2(`${tenantId}/group-roles`, [
    `${tenantId}/groups/${groupId}/group-roles`,
    `${tenantId}/groups`,
    `${groupId}`,
  ]);

  const handleUnassign = (groupRoleId: number) => {
    setLoadingId(groupRoleId);
    unAssign(groupRoleId, {
      onSuccess: () => {
        setLoadingId(null);
        toast({
          type: "success",
          response: "Group Role unassigned successfully",
        });
      },
      onError: (error) => {
        setLoadingId(null);
        toast({
          type: "error",
          response: error,
        });
      },
    });
  };

  const columns: TableProps<GroupRole>["columns"] = [
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (_, record) => record.roleCodeValue.codeValue,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (_, record) => {
        const c = record.client.firstName
          ? `${record.client.firstName} ${record.client.middleName || ""} ${
              record.client.lastName
            }`
          : record.client.fullName;
        return c;
      },
    },
    {
      title: <span className="flex justify-end">Action</span>,
      key: "action",
      render: (_, record) => (
        <div className="flex justify-end">
          <Popconfirm
            title="Unassign Role"
            description="Are you sure you want to unassign this role?"
            onConfirm={() => handleUnassign(record.id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <MyButton
              type="danger"
              loading={loadingId === record.id}
              icon={<MinusOutlined />}
            >
              Un-Assign
            </MyButton>
          </Popconfirm>
        </div>
      ),
    },
  ];

  if (!canUnassignRoleGroup) {
    columns.pop();
  }

  return (
    <>
      <PageHeader
        pageTitle="Committee"
        createModal={
          canAssignRoleGroup ? (
            <CreateModal
              isModalOpen={isModalOpen}
              setIsModalOpen={setIsModalOpen}
              pageTitle="Role"
              submitType="create"
              CreateForm={
                <CreateGroupRoleForm setIsModalOpen={setIsModalOpen} />
              }
            />
          ) : null
        }
      />

      {status === "error" ? (
        <Alert_ message="Error" description={error} type="error" />
      ) : (
        <Table
          columns={columns}
          dataSource={data}
          loading={status === "pending"}
          rowKey="id"
        />
      )}
    </>
  );
}
