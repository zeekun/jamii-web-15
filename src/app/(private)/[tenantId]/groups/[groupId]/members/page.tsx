"use client";
import { useCreate, useDeleteV2, useGet } from "@/api";
import Alert_ from "@/components/alert";
import { Client } from "@/types";
import type { TableProps } from "antd";
import { Button, Form, Popconfirm, Select, Table, Typography } from "antd";
import { useParams, useSearchParams } from "next/navigation";
import { useState } from "react";
import MyButton from "@/components/my-button";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import toast from "@/utils/toast";
import { filterOption } from "@/utils/strings";
import { hasPermission } from "@/utils/permissions";
import { useRoles } from "@/providers/RolesProvider";
import {
  associateClientsGroupsPermissions,
  disassociateClientsGroupsPermissions,
} from "../../constants";
const { Title } = Typography;

export default function Page() {
  const { tenantId, groupId } = useParams();
  const searchParams = useSearchParams();
  const officeId = searchParams.get("officeId");
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const {
    permissions,
    error: permissionsError,
    isPermissionsLoading,
  } = useRoles();

  const canAssociateClientsGroups = hasPermission(
    permissions,
    associateClientsGroupsPermissions
  );

  const canDisassociateClientsGroups = hasPermission(
    permissions,
    disassociateClientsGroupsPermissions
  );

  const [form] = Form.useForm();

  const { data, status, error } = useGet<Client[]>(
    `${tenantId}/groups/${groupId}/clients`,
    [`${tenantId}/groups/${groupId}/clients`]
  );

  const { mutate: unAssign } = useDeleteV2(`${tenantId}/clients`, [
    `${tenantId}/groups/${groupId}/clients`,
    `${tenantId}/groups`,
    `${groupId}`,
  ]);

  const {
    status: groupClientsStatus,
    data: groupClients,
    error: groupClientsError,
  } = useGet<Client[]>(
    `${tenantId}/clients?filter={"where":{"officeId":${officeId},"isActive":${true}}}`,
    [`${tenantId}/clients?filter={"where":{"officeId":${officeId}}}`]
  );

  let groupClientOptions: any = [];

  if (groupClientsStatus === "success" && groupClients) {
    groupClientOptions = groupClients.map((client) => {
      const c = client.firstName
        ? `${client.firstName} ${client.middleName || ""} ${client.lastName}`
        : client.fullName;

      return {
        value: client.id,
        label: c,
      };
    });
  }

  const handleUnassign = (groupRoleId: number) => {
    setLoadingId(groupRoleId);
    unAssign(groupRoleId, {
      onSuccess: () => {
        setLoadingId(null);
        toast({
          type: "success",
          response: "Group Member removed successfully",
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

  const { mutate: insertGroupRole } = useCreate(`${tenantId}/group-clients`, [
    `${tenantId}/groups/${groupId}/clients`,
  ]);

  function onFinish(values: any) {
    console.log();

    insertGroupRole(
      { clientId: values.clientId, groupId: Number(groupId) },
      {
        onSuccess: () => {
          toast({
            type: "success",
            response: `Member added successfully.`,
          });
          form.resetFields();
        },
        onError(error, variables, context) {
          toast({ type: "error", response: error });
        },
      }
    );
  }

  let columns: TableProps<Client>["columns"] = [
    {
      title: "Member",
      dataIndex: "id",
      key: "id",
      render: (_, record) =>
        record.firstName
          ? `${record.firstName} ${record.middleName || ""} ${record.lastName}`
          : record.fullName,
    },
    {
      title: <span className="flex justify-end">Action</span>,
      key: "action",
      render: (_, record) => (
        <div className="flex justify-end">
          <Popconfirm
            title="Remove Role"
            description="Are you sure you want to remove this member?"
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
              Remove
            </MyButton>
          </Popconfirm>
        </div>
      ),
    },
  ];

  if (!canDisassociateClientsGroups) {
    columns.pop();
  }

  return (
    <>
      {status === "error" ? (
        <Alert_ message="Error" description={error} type="error" />
      ) : (
        <>
          <div className="flex justify-between w-full items-center">
            <Title level={5} className="w-1/3">
              Associate Members
            </Title>

            {canAssociateClientsGroups ? (
              <Form
                layout="vertical"
                form={form}
                name="memberForm"
                onFinish={onFinish}
                className="flex justify-end w-full gap-2"
              >
                <Form.Item
                  name="clientId"
                  rules={[
                    { required: true, message: "Please enter the Client" },
                  ]}
                  className="w-1/4"
                >
                  <Select
                    className="w-0.5"
                    options={groupClientOptions}
                    allowClear
                    showSearch
                    filterOption={filterOption}
                  />
                </Form.Item>

                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  htmlType="submit"
                >
                  Add Member
                </Button>
              </Form>
            ) : null}
          </div>

          <Table
            columns={columns}
            dataSource={data}
            loading={status === "pending"}
            rowKey="id"
          />
        </>
      )}
    </>
  );
}
