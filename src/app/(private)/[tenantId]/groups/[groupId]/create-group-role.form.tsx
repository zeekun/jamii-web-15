"use client";
import { useCreate, useGet, useGetById, usePatch } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { Client, ClientIdentifier, Code, CodeValue, SubmitType } from "@/types";
import { Form, Select } from "antd";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { filterOption } from "@/utils/strings";
import toast from "@/utils/toast";
import Loading from "@/components/loading";

export default function CreateGroupRoleForm(props: {
  submitType?: SubmitType;
  clientIdentityId?: number;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { tenantId, groupId } = useParams();
  const { submitType = "create", clientIdentityId, setIsModalOpen } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);

  const { mutate: insertGroupRole } = useCreate(
    `${tenantId}/groups/${groupId}/group-roles`,
    [`${tenantId}/groups/${groupId}/group-roles`]
  );
  const { mutate: updateUser } = usePatch(
    `${tenantId}/client-identifiers`,
    clientIdentityId
  );

  const {
    status: groupRoleStatus,
    data: identifier,
    error: identifierError,
  } = useGetById<ClientIdentifier>(`${tenantId}/group-roles`, clientIdentityId);

  useEffect(() => {
    if (
      submitType === "update" &&
      groupRoleStatus === "success" &&
      identifier
    ) {
      form.setFieldsValue(identifier);
    }
  }, [submitType, groupRoleStatus, identifier, form]);

  const onReset = () => {
    form.resetFields();
  };

  function onFinish(values: any) {
    setSubmitLoader(true);

    const submitTypeMessage = submitType === "create" ? "created" : "updated";

    if (submitType === "create") {
      insertGroupRole(values, {
        onSuccess: () => {
          setSubmitLoader(false);
          toast({
            type: "success",
            response: `Role ${submitTypeMessage} successfully.`,
          });
          form.resetFields();
          setIsModalOpen(false);
        },
        onError(error, variables, context) {
          toast({ type: "error", response: error });

          setSubmitLoader(false);
        },
      });
    } else {
      updateUser(
        { groupId, ...identifier },
        {
          onSuccess: () => {
            setSubmitLoader(false);

            toast({
              type: "success",
              response: `Role ${submitTypeMessage} successfully.`,
            });
          },
          onError(error, variables, context) {
            toast({
              type: "error",
              response: error,
            });

            setSubmitLoader(false);
          },
        }
      );
    }
  }

  const {
    status: groupClientsStatus,
    data: groupClients,
    error: groupClientsError,
  } = useGet<Client[]>(`${tenantId}/groups/${groupId}/clients`, [
    `${tenantId}/groups/${groupId}/clients`,
  ]);

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

  const {
    status: groupRolesStatus,
    data: groupRoles,
    error: groupRolesError,
  } = useGet<Code[]>(
    `${tenantId}/codes?filter={"where":{"name":"group-role"}}`,
    [`${tenantId}/codes?filter={"where":{"name":"group-role"}}`]
  );

  let groupRolesOptions: any = [];

  if (groupRolesStatus === "success" && groupRoles[0]?.codeValues) {
    groupRolesOptions = groupRoles[0]?.codeValues
      .sort((a: CodeValue, b: CodeValue) => a.orderPosition - b.orderPosition)
      .filter(
        (code: CodeValue) => code.isActive && code.tenantId === Number(tenantId)
      )
      .map((code: { id: number; codeValue: string }) => {
        return { value: code.id, label: code.codeValue };
      });
  }

  if (groupRoleStatus === "pending") {
    return <Loading />;
  }

  return (
    <Form
      layout="vertical"
      form={form}
      name={submitType === "create" ? submitType : `${submitType}${groupId}`}
      onFinish={onFinish}
      className="grid grid-cols-2 gap-2"
    >
      <Form.Item
        className="col-span-2"
        name="clientId"
        label="Client"
        rules={[{ required: true }]}
      >
        <Select
          options={groupClientOptions}
          allowClear
          showSearch
          filterOption={filterOption}
        />
      </Form.Item>

      <Form.Item
        className="col-span-2"
        name="roleCodeValueId"
        label="Role"
        rules={[{ required: true }]}
      >
        <Select
          options={groupRolesOptions}
          allowClear
          showSearch
          filterOption={filterOption}
        />
      </Form.Item>

      <div className="col-span-2 ">
        <FormSubmitButtons submitLoader={submitLoader} onReset={onReset} />
      </div>
    </Form>
  );
}
