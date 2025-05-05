"use client";
import { useCreate, useGet, useGetById, usePatch, usePatchV2 } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { Client, Group, SubmitType, Tenant } from "@/types";
import { Form, Input, Select } from "antd";
import { useEffect, useState } from "react";
import { ENDPOINT, PAGE_TITLE, QUERY_KEY } from "../constants";
import { useParams, useRouter } from "next/navigation";
import toast from "@/utils/toast";
import { filterOption } from "@/utils/strings";

export default function TransferClientForm(props: {
  submitType?: SubmitType;
  officeId: number;
  groupId: number;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const router = useRouter();
  const { tenantId } = useParams();
  const { submitType = "create", groupId, setIsModalOpen, officeId } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);

  // const {
  //   status: groupClientsStatus,
  //   data: groupClients,
  //   error: groupClientsError,
  // } = useGet<Client[]>(
  //   `${tenantId}/clients?filter={"where":{"officeId":${officeId},"":${},  "isActive":${true}}}`,
  //   [`${tenantId}/clients?filter={"where":{"officeId":${officeId}}}`]
  // );

  const {
    status: groupClientsStatus,
    data: groupClients,
    error: groupClientsError,
  } = useGet<Client[]>(`${tenantId}/groups/${groupId}/clients`, [
    `${tenantId}/groups/${groupId}/clients`,
  ]);

  let groupClientOptions: any = [];

  if (groupClientsStatus === "success") {
    groupClientOptions = groupClients.map((client: Client) => {
      return {
        value: client.id,
        label: `${
          client.firstName
            ? `${client.firstName} ${client.middleName || ""} ${
                client.lastName
              }`
            : client.fullName
        }`,
      };
    });
  }

  const {
    status: groupsStatus,
    data: groups,
    error: groupsError,
  } = useGet<Group[]>(
    `${tenantId}/groups?filter={"where":{"officeId":${officeId},"isActive":${true}}}`,
    [`${tenantId}/groups?filter={"where":{"officeId":${officeId}}}`]
  );

  let groupsOptions: any = [];

  if (groupsStatus === "success") {
    groupsOptions = groups.map((group: Group) => {
      return {
        value: group.id,
        label: group.name,
      };
    });
  }

  const { mutate: insertUser } = useCreate(
    `${tenantId}/transfer-group-clients`,
    [`${tenantId}/${QUERY_KEY}`, `${tenantId}/tenants/count`]
  );

  const {
    status: tenantStatus,
    data: tenant,
    error: userError,
  } = useGetById<Tenant>(`${tenantId}/${ENDPOINT}`, groupId);

  useEffect(() => {
    if (submitType === "update" && tenantStatus === "success" && tenant) {
      form.setFieldsValue(tenant);
    }
  }, [submitType, tenantStatus, tenant, form]);

  const onReset = () => {
    form.resetFields();
  };

  function onFinish(values: any) {
    setSubmitLoader(true);

    insertUser(
      { ...values, groupId },
      {
        onSuccess: (response: any) => {
          setSubmitLoader(false);
          setIsModalOpen(false);
          toast({
            type: "success",
            response: `Client transferred successfully.`,
          });
          form.resetFields();
        },
        onError(error, variables, context) {
          toast({ type: "error", response: error });

          setSubmitLoader(false);
        },
      }
    );
  }

  return (
    <Form
      layout="vertical"
      form={form}
      name={submitType === "create" ? submitType : `${submitType}${groupId}`}
      onFinish={onFinish}
      className="grid grid-cols-12 gap-2"
    >
      <Form.Item
        className="col-span-9"
        name="clients"
        label="Clients"
        rules={[{ required: true }]}
      >
        <Select
          mode="multiple"
          allowClear
          showSearch
          filterOption={filterOption}
          options={groupClientOptions}
        />
      </Form.Item>

      <Form.Item
        className="col-span-3"
        name="toGroupId"
        label="To Group"
        rules={[{ required: true }]}
      >
        <Select
          allowClear
          showSearch
          filterOption={filterOption}
          options={groupsOptions}
        />
      </Form.Item>

      <div className="col-span-12 ">
        <FormSubmitButtons submitLoader={submitLoader} onReset={onReset} />
      </div>
    </Form>
  );
}
