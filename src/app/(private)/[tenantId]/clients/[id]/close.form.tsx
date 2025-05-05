"use client";
import { useGet, usePatch } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { DatePicker, Form, Select } from "antd";
import { useState } from "react";
import { ENDPOINT, PAGE_TITLE } from "../constants";
import dayjs from "dayjs";
import { dateFormat } from "@/utils/dates";
import toast from "@/utils/toast";
import { Client, Code, CodeValue } from "@/types";
import { filterOption } from "@/utils/strings";
import { useParams } from "next/navigation";

export default function CloseForm(props: {
  client?: Client;
  undoClosure?: boolean;
}) {
  const { tenantId } = useParams();
  const { client, undoClosure = false } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);

  const id = client?.id;

  let qk = [`clients/${id}`];

  const { mutate: closeClient } = usePatch(`${tenantId}/${ENDPOINT}`, id, qk);

  const onReset = () => {
    form.resetFields();
  };

  function onFinish(values: any) {
    setSubmitLoader(true);

    let statusEnum;
    if (undoClosure === false) {
      statusEnum = "CLOSED";
    } else {
      statusEnum = "PENDING";
    }

    let updatedValues = {
      client: {
        ...values,
        legalFormEnum: client?.legalFormEnum,
        officeId: client?.officeId,
        isActive: false,
        statusEnum,
      },
    };

    const successResponse =
      undoClosure === false
        ? "Client successfully closed"
        : "Client closure undone successfully";

    closeClient(
      { id, ...updatedValues },
      {
        onSuccess: () => {
          setSubmitLoader(false);
          toast({
            type: "success",
            response: successResponse,
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
    status: clientClosureReasonsStatus,
    data: clientClosureReasons,
    error: clientClosureReasonsError,
  } = useGet<Code[]>(
    `${tenantId}/codes?filter={"where":{"name":"client-closure-reason"}}`,
    [`${tenantId}/client-closure-reason-code-values`]
  );

  let clientClosureReasonsOptions: any = [];

  if (clientClosureReasonsStatus === "success") {
    if (clientClosureReasons[0]?.codeValues) {
      clientClosureReasonsOptions = clientClosureReasons[0]?.codeValues
        .sort((a: CodeValue, b: CodeValue) => a.orderPosition - b.orderPosition)
        .filter((code: CodeValue) => code.isActive)
        .map((code: CodeValue) => {
          return { value: code.id, label: code.codeValue };
        });
    }
  }

  return (
    <Form
      layout="vertical"
      form={form}
      name={PAGE_TITLE}
      onFinish={onFinish}
      className="grid grid-cols-2 gap-2"
    >
      {undoClosure === false ? (
        <>
          <Form.Item
            className="col-span-2"
            name="closedOnDate"
            label="Closure Date"
            initialValue={dayjs()}
            rules={[{ required: true, message: "Closure Date is required!" }]}
          >
            <DatePicker
              className="w-full"
              maxDate={dayjs()}
              format={dateFormat}
            />
          </Form.Item>

          <Form.Item
            className="col-span-2"
            name="closureReasonId"
            label="Closure Reason"
            rules={[{ required: true, message: "Closure Reason is required!" }]}
          >
            <Select
              allowClear
              showSearch
              filterOption={filterOption}
              options={clientClosureReasonsOptions}
            />
          </Form.Item>
        </>
      ) : (
        <>
          <Form.Item
            className="col-span-2"
            name="reopenedOnDate"
            label="Re Opened Date"
            initialValue={dayjs()}
            rules={[{ required: true, message: "Re Opened Date is required!" }]}
          >
            <DatePicker
              className="w-full"
              maxDate={dayjs()}
              minDate={dayjs()}
              format={dateFormat}
            />
          </Form.Item>
        </>
      )}

      <div className="col-span-2">
        <FormSubmitButtons submitLoader={submitLoader} onReset={onReset} />
      </div>
    </Form>
  );
}
