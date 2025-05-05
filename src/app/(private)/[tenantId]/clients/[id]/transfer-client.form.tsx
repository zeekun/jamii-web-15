"use client";
import { useGet, usePatch } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { Form, Select } from "antd";
import { useState } from "react";
import { ENDPOINT, PAGE_TITLE } from "../constants";
import toast from "@/utils/toast";
import { Client, Employee, Office } from "@/types";
import { filterOption } from "@/utils/strings";
import { useParams } from "next/navigation";

export default function TransferClientForm(props: { client?: Client }) {
  const { client } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);
  const { tenantId } = useParams();

  const id = client?.id;

  let qk = [`${tenantId}/clients/${id}`];

  const { mutate: transferClient } = usePatch(
    `${tenantId}/${ENDPOINT}`,
    id,
    qk
  );

  const onReset = () => {
    form.resetFields();
  };

  function onFinish(values: any) {
    setSubmitLoader(true);

    let updatedValues = {
      client: {
        ...values,
        legalFormEnum: client?.legalFormEnum,
        officeId: values.officeId,
        staffId: null,
      },
    };

    transferClient(
      { id, ...updatedValues },
      {
        onSuccess: () => {
          setSubmitLoader(false);
          toast({
            type: "success",
            response: "Client transferred successfully",
          });
        },
        onError(error, variables, context) {
          setSubmitLoader(false);
          toast({
            type: "error",
            response: error,
          });
        },
      }
    );
  }

  const {
    status: officesStatus,
    data: offices,
    error: officesError,
  } = useGet<Office[]>(`${tenantId}/offices`, [`${tenantId}/offices`]);

  let officesOptions: any = [];

  if (officesStatus === "success") {
    officesOptions = offices.map((office: Office) => {
      return {
        value: office.id,
        label: office.name,
      };
    });
  }

  return (
    <Form
      layout="vertical"
      form={form}
      name={PAGE_TITLE}
      onFinish={onFinish}
      className="grid grid-cols-2 gap-2"
    >
      <>
        <Form.Item
          className="col-span-2"
          name="officeId"
          label="Office"
          rules={[{ required: true, message: "Office is required!" }]}
        >
          <Select
            allowClear
            showSearch
            filterOption={filterOption}
            options={officesOptions}
          />
        </Form.Item>
      </>

      <div className="col-span-2">
        <FormSubmitButtons submitLoader={submitLoader} onReset={onReset} />
      </div>
    </Form>
  );
}
