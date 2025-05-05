"use client";
import { usePatchV2 } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { DatePicker, Form, Input } from "antd";
import { useState } from "react";
import { ENDPOINT, PAGE_TITLE } from "./constants";
import dayjs from "dayjs";
import { dateFormat } from "@/utils/dates";
import { ShareAccount } from "@/types";
import { useParams } from "next/navigation";
import toast from "@/utils/toast";
import { off } from "process";

export default function ApproveForm(props: {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  share?: ShareAccount;
  undoApproval?: boolean;
}) {
  const { tenantId, id, shareId } = useParams();
  const { share, undoApproval = false, setIsModalOpen } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);

  const { mutate: approveLoan } = usePatchV2(
    `${tenantId}/${ENDPOINT}`,
    `${shareId}`,
    [
      `${tenantId}/${ENDPOINT}`,
      `${shareId}`,
      `${tenantId}/clients/${id}/share-accounts?filter={"where":{"statusEnum":{"neq":"CLOSED"}},"order":["accountNo DESC"]}`,
    ]
  );

  const onReset = () => {
    form.resetFields();
  };

  function onFinish(values: any) {
    setSubmitLoader(true);

    interface UpdatedValues {
      shareAccount: {};
      note?: string;
    }

    let updatedValues: UpdatedValues = { shareAccount: {} };

    console.log(share);

    if (undoApproval === false) {
      if (share) {
        console.log("approval", share);
        const totalApprovedShares =
          share.totalApprovedShares + share.totalPendingShares;

        updatedValues = {
          shareAccount: {
            approvedDate: values.approvedDate,
            statusEnum: "APPROVED",
            totalApprovedShares,
            totalPendingShares: 0,
            currencyCode: share?.currencyCode,
            ...(share?.group
              ? { groupId: share.groupId }
              : { clientId: share.clientId }),

            shareProductId: share.shareProductId,
          },
          note: values.note,
        };
      }
    } else {
      if (share) {
        console.log("undoApproval", share);
        const totalPendingShares =
          share.totalApprovedShares + share.totalPendingShares;

        updatedValues = {
          shareAccount: {
            ...values.shareAccount,
            approvedDate: null,
            approvedUserId: null,
            shareProductId: share.shareProductId,
            statusEnum: "SUBMITTED AND AWAITING APPROVAL",
            ...(share?.group
              ? { groupId: share.groupId }
              : { clientId: share.clientId }),
            officeId:
              share?.client?.officeId ?? share?.group?.officeId ?? undefined,
            totalApprovedShares: 0,
            totalPendingShares,
          },
          note: values.note,
        };
      }
    }

    approveLoan(
      { id, ...updatedValues },
      {
        onSuccess: () => {
          const response = undoApproval === false ? "approved" : "unapproved";
          toast({
            type: "success",
            response: `Share successfully ${response}`,
          });
          setSubmitLoader(false);
          setIsModalOpen(false);
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
            name="approvedDate"
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
