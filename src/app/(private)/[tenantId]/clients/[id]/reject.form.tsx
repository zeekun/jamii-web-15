"use client";
import { useGet, usePatch } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { DatePicker, Form, Select } from "antd";
import { useState } from "react";
import { PAGE_TITLE } from "../constants";
import dayjs from "dayjs";
import { dateFormat } from "@/utils/dates";
import toast from "@/utils/toast";
import { Client, Code, CodeValue, SavingsAccount } from "@/types";
import { filterOption } from "@/utils/strings";

export default function RejectForm(props: {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  client?: Client;
  saving?: SavingsAccount;
  undoRejection?: boolean;
}) {
  const { client, saving, undoRejection = false, setIsModalOpen } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);

  let id = client?.id;

  let qk = [`clients/${id}`];
  let endpoint = "clients";

  if (saving) {
    endpoint = "savings-accounts";
    id = saving.id;
  }

  const { mutate: rejectClient } = usePatch(endpoint, id, qk);

  const onReset = () => {
    form.resetFields();
  };

  function onFinish(values: any) {
    setSubmitLoader(true);

    let statusEnum;
    if (undoRejection === false) {
      statusEnum = "REJECTED";
    } else {
      if (client) {
        statusEnum = "PENDING";
      } else if (saving) {
        statusEnum = "SUBMITTED AND AWAITING APPROVAL";
      }
    }

    let updatedValues;
    let updatedClientValues = {
      client: {
        ...values,
        legalFormEnum: client?.legalFormEnum,
        officeId: client?.officeId,
        isActive: false,
        statusEnum,
      },
    };

    const updatedSavingAccountValues = {
      savingsAccount: {
        statusEnum,
        subStatusEnum: statusEnum,
      },
    };

    if (client) {
      updatedValues = updatedClientValues;
    } else if (saving) {
      updatedValues = updatedSavingAccountValues;
    }

    const successResponse =
      undoRejection === false
        ? "Client successfully rejected"
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
          setIsModalOpen(false);
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
    status: clientRejectionReasonsStatus,
    data: clientRejectionReasons,
    error: clientRejectionReasonsError,
  } = useGet<Code[]>(
    `codes?filter={"where":{"name":"client-rejection-reason"}}`,
    ["client-rejection-reason-code-values"]
  );

  let clientRejectionReasonsOptions: any = [];

  if (clientRejectionReasonsStatus === "success") {
    if (clientRejectionReasons[0]?.codeValues) {
      clientRejectionReasonsOptions = clientRejectionReasons[0]?.codeValues
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
      {undoRejection === false ? (
        <>
          <Form.Item
            className="col-span-2"
            name="rejectedOnDate"
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

          <Form.Item
            className="col-span-2"
            name="rejectionReasonId"
            label="Rejection Reason"
            rules={[
              { required: true, message: "Rejection Reason is required!" },
            ]}
          >
            <Select
              allowClear
              showSearch
              filterOption={filterOption}
              options={clientRejectionReasonsOptions}
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
