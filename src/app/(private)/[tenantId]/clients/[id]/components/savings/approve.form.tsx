"use client";
import { usePatch } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { DatePicker, Form, Input } from "antd";
import { useState } from "react";
import { ENDPOINT, PAGE_TITLE } from "./constants";
import dayjs from "dayjs";
import { dateFormat } from "@/utils/dates";
import { SavingsAccount } from "@/types";
import { useParams } from "next/navigation";
import toast from "@/utils/toast";

type UpdatedValuesType = {
  savingsAccount: {
    approvedOnDate: string | null;
    statusEnum: "APPROVED" | "SUBMITTED AND AWAITING APPROVAL";
    approvedOnUserId?: null;
  };
  note: string;
};

export default function ApproveForm(props: {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  id?: number;
  clientId: number | undefined;
  saving: SavingsAccount | undefined;
  undoApproval?: boolean;
  page?: "CLIENT" | "SAVING ACCOUNT";
}) {
  const { tenantId } = useParams();
  const { id, undoApproval = false, setIsModalOpen } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);
  const { mutate: approveLoan } = usePatch(`${tenantId}/${ENDPOINT}`, id);

  const onReset = () => {
    form.resetFields();
  };

  function onFinish(values: any) {
    setSubmitLoader(true);

    let updatedValues: UpdatedValuesType = {
      savingsAccount: {
        approvedOnDate: values.approvedOnDate,
        statusEnum: "APPROVED",
      },
      note: values.note,
    };

    if (undoApproval === false) {
      updatedValues = {
        savingsAccount: {
          ...values.savingsAccount,
          statusEnum: "APPROVED",
          approvedOnDate: values.approvedOnDate,
        },
        note: values.note,
      };
    } else {
      updatedValues = {
        savingsAccount: {
          approvedOnDate: null,
          statusEnum: "SUBMITTED AND AWAITING APPROVAL",
          approvedOnUserId: null,
        },
        note: values.note,
      };
    }

    approveLoan(
      { id, ...updatedValues },
      {
        onSuccess: () => {
          setSubmitLoader(false);
          toast({ type: "success", response: "Saving successfully approved" });
          setIsModalOpen(false);
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
      name={PAGE_TITLE}
      onFinish={onFinish}
      className="grid grid-cols-2 gap-2"
    >
      {!undoApproval && (
        <>
          {" "}
          <Form.Item
            className="col-span-2"
            name="approvedOnDate"
            label="Approved On Date"
            initialValue={dayjs()}
            rules={[
              { required: true, message: "Approved On Date is required!" },
            ]}
          >
            <DatePicker
              className="w-full"
              maxDate={dayjs()}
              format={dateFormat}
            />
          </Form.Item>
          <Form.Item className="col-span-2" name="note" label="Note">
            <Input.TextArea rows={4} />
          </Form.Item>
        </>
      )}

      <div className="col-span-2">
        <FormSubmitButtons submitLoader={submitLoader} onReset={onReset} />
      </div>
    </Form>
  );
}
