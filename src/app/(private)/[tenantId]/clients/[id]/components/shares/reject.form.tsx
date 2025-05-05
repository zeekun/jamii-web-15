"use client";
import { useGet, usePatch } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { DatePicker, Form, Select } from "antd";
import { useState } from "react";
import dayjs from "dayjs";
import { dateFormat } from "@/utils/dates";
import toast from "@/utils/toast";
import { Code, CodeValue } from "@/types";
import { filterOption } from "@/utils/strings";
import { ENDPOINT } from "./constants";
import { useParams } from "next/navigation";

export default function RejectForm(props: { undoRejection?: boolean }) {
  const { tenantId, id, shareId } = useParams();
  const { undoRejection = false } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);

  const { mutate: rejectClient } = usePatch(
    `${tenantId}/${ENDPOINT}`,
    String(shareId)
  );

  const onReset = () => {
    form.resetFields();
  };

  function onFinish(values: any) {
    setSubmitLoader(true);

    let statusEnum;
    let rejectedDate = null;
    if (undoRejection === false) {
      statusEnum = "REJECTED";
      rejectedDate = values.rejectedDate;
    } else {
      statusEnum = "SUBMITTED AND AWAITING APPROVAL";
    }

    let updatedValues = {
      shareAccount: {
        statusEnum,
        subStatusEnum: statusEnum,
        rejectedDate,
      },
    };

    const successResponse =
      undoRejection === false
        ? "Share Account successfully rejected"
        : "Client rejection undone successfully";

    rejectClient(
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

  return (
    <Form
      layout="vertical"
      form={form}
      name={`rejectForm`}
      onFinish={onFinish}
      className="grid grid-cols-2 gap-2"
    >
      {undoRejection === false ? (
        <>
          <Form.Item
            className="col-span-2"
            name="rejectedDate"
            label="Rejection Date"
            initialValue={dayjs()}
            rules={[{ required: true, message: "Rejection Date is required!" }]}
          >
            <DatePicker
              className="w-full"
              maxDate={dayjs()}
              format={dateFormat}
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
