"use client";
import { useCreate, useGet, useGetById, usePatch } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { ClientIdentifier, Code, CodeValue, SubmitType } from "@/types";
import { Form, Input, Select } from "antd";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { filterOption } from "@/utils/strings";
import toast from "@/utils/toast";
import Loading from "@/components/loading";

export default function CreateClientIdentityForm(props: {
  submitType?: SubmitType;
  clientIdentityId?: number;
}) {
  const { tenantId } = useParams();
  const { submitType = "create", clientIdentityId } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);

  const { id } = useParams();

  const { mutate: insertIdentifier } = useCreate(
    `${tenantId}/clients/${id}/client-identifiers`,
    [`${tenantId}/clients/${id}/client-identifiers`]
  );
  const { mutate: updateUser } = usePatch(
    `${tenantId}/client-identifiers`,
    clientIdentityId
  );

  const {
    status: identifierStatus,
    data: identifier,
    error: identifierError,
  } = useGetById<ClientIdentifier>(
    `${tenantId}/client-identifiers`,
    clientIdentityId
  );

  useEffect(() => {
    if (
      submitType === "update" &&
      identifierStatus === "success" &&
      identifier
    ) {
      form.setFieldsValue(identifier);
    }
  }, [submitType, identifierStatus, identifier, form]);

  const onReset = () => {
    form.resetFields();
  };

  function onFinish(values: any) {
    setSubmitLoader(true);

    const submitTypeMessage = submitType === "create" ? "created" : "updated";

    if (submitType === "create") {
      insertIdentifier(values, {
        onSuccess: () => {
          setSubmitLoader(false);
          toast({
            type: "success",
            response: `Identity ${submitTypeMessage} successfully.`,
          });
          form.resetFields();
        },
        onError(error, variables, context) {
          toast({ type: "error", response: error });

          setSubmitLoader(false);
        },
      });
    } else {
      updateUser(
        { id, ...identifier },
        {
          onSuccess: () => {
            setSubmitLoader(false);

            toast({
              type: "success",
              response: `Identity ${submitTypeMessage} successfully.`,
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
    status: clientIdentifiersStatus,
    data: clientIdentifiers,
    error: clientIdentifiersError,
  } = useGet<Code[]>(
    `${tenantId}/codes?filter={"where":{"name":"client-identifier"}}`,
    [`${tenantId}/codes?filter={"where":{"name":"client-identifier"}}`]
  );

  let documentTypeOptions: any = [];

  if (
    clientIdentifiersStatus === "success" &&
    clientIdentifiers[0]?.codeValues
  ) {
    documentTypeOptions = clientIdentifiers[0]?.codeValues
      .sort((a: CodeValue, b: CodeValue) => a.orderPosition - b.orderPosition)
      .filter(
        (code: CodeValue) => code.isActive && code.tenantId === Number(tenantId)
      )
      .map((code: { id: number; codeValue: string }) => {
        return { value: code.id, label: code.codeValue };
      });
  }

  if (identifierStatus === "pending") {
    return <Loading />;
  }

  return (
    <Form
      layout="vertical"
      form={form}
      name={submitType === "create" ? submitType : `${submitType}${id}`}
      onFinish={onFinish}
      className="grid grid-cols-2 gap-2"
    >
      <Form.Item
        className="col-span-2"
        name="documentTypeId"
        label="Document Type"
        rules={[{ required: true, message: "Document Type is required!" }]}
      >
        <Select
          options={documentTypeOptions}
          allowClear
          showSearch
          filterOption={filterOption}
        />
      </Form.Item>

      <Form.Item
        className="col-span-2"
        name="status"
        label="Status"
        rules={[{ required: true, message: "Status is required!" }]}
      >
        <Select>
          <option value={"active"}>Active</option>
          <option value={"inactive"}>Inactive</option>
        </Select>
      </Form.Item>

      <Form.Item
        className="col-span-2"
        name="documentKey"
        label="Unique ID #"
        rules={[{ required: true, message: "Unique ID # is required!" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item className="col-span-2" name="description" label="Description">
        <Input.TextArea rows={4} />
      </Form.Item>

      <div className="col-span-2 ">
        <FormSubmitButtons submitLoader={submitLoader} onReset={onReset} />
      </div>
    </Form>
  );
}
