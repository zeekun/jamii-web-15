"use client";
import { useGet, usePatch } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { DatePicker, Form, Select } from "antd";
import { useState } from "react";
import { ENDPOINT, PAGE_TITLE } from "./constants";
import dayjs from "dayjs";
import { dateFormat } from "@/utils/dates";
import toast from "@/utils/toast";
import { Client, Code, CodeValue, SavingsAccount } from "@/types";
import { filterOption } from "@/utils/strings";
import { useParams } from "next/navigation";

export default function WithdrawForm(props: {
  client?: Client;
  saving?: SavingsAccount;
  undoWithdraw?: boolean;
}) {
  const { tenantId } = useParams();
  const { client, undoWithdraw = false } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);

  const id = client?.id;

  let qk = [`clients/${id}`];

  const { mutate: withdrawClient } = usePatch(
    `${tenantId}/${ENDPOINT}`,
    id,
    qk
  );

  const onReset = () => {
    form.resetFields();
  };

  function onFinish(values: any) {
    setSubmitLoader(true);

    let statusEnum;
    if (undoWithdraw === false) {
      statusEnum = "WITHDRAWN";
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
      undoWithdraw === false
        ? "Client successfully withdrawn"
        : "Client withdraw undone successfully";

    withdrawClient(
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
    status: clientWithdrawReasonsStatus,
    data: clientWithdrawReasons,
    error: clientWithdrawReasonsError,
  } = useGet<Code[]>(
    `${tenantId}/codes?filter={"where":{"name":"client-withdraw-reason"}}`,
    [`${tenantId}/codes?filter={"where":{"name":"client-withdraw-reason"}}`]
  );

  let clientWithdrawReasonsOptions: any = [];

  if (clientWithdrawReasonsStatus === "success") {
    if (clientWithdrawReasons[0]?.codeValues) {
      clientWithdrawReasonsOptions = clientWithdrawReasons[0]?.codeValues
        .sort((a: CodeValue, b: CodeValue) => a.orderPosition - b.orderPosition)
        .filter(
          (code: CodeValue) =>
            code.isActive && code.tenantId === Number(tenantId)
        )
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
      {undoWithdraw === false ? (
        <>
          <Form.Item
            className="col-span-2"
            name="withdrawnOnDate"
            label="Withdrawal Date"
            initialValue={dayjs()}
            rules={[
              { required: true, message: "Withdrawal Date is required!" },
            ]}
          >
            <DatePicker
              className="w-full"
              maxDate={dayjs()}
              format={dateFormat}
            />
          </Form.Item>

          <Form.Item
            className="col-span-2"
            name="withdrawReasonId"
            label="Withdraw Reason"
            rules={[
              { required: true, message: "Withdraw Reason is required!" },
            ]}
          >
            <Select
              allowClear
              showSearch
              filterOption={filterOption}
              options={clientWithdrawReasonsOptions}
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
