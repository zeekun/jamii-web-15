"use client";
import { useCreate } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { Checkbox, DatePicker, Form, Input, Select } from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import { ENDPOINT, PAGE_TITLE, QUERY_KEY } from "../constants";
import { DebitCreditEntry, GlJournalEntry, SubmitType } from "@/types";
import toast from "@/utils/toast";
import { useParams } from "next/navigation";

export default function CreateForm(props: {
  submitType?: SubmitType;
  id?: number;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedTransactions: GlJournalEntry[];
  setOpen?: (value: boolean) => void;
  open?: boolean;
}) {
  const { tenantId } = useParams();
  const {
    submitType = "create",
    selectedTransactions,
    setOpen,
    open,
    setIsModalOpen,
  } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);

  const { mutate: insertGlJournalEntry } = useCreate(
    `${tenantId}/${ENDPOINT}`,
    [QUERY_KEY]
  );

  const onReset = () => {
    form.resetFields();
  };

  function onFinish(values: any) {
    setSubmitLoader(true);

    const submitTypeMessage = submitType === "create" ? "created" : "updated";

    // Initialize updatedValues with credits and debits inside glJournalEntry
    let updatedValues = {
      glJournalEntry: {
        manualEntry: true,
        entryDate: selectedTransactions[0].entryDate,
        officeId: selectedTransactions[0].officeId,
        currencyId: selectedTransactions[0].currencyId,
        refNum: selectedTransactions[0].refNum,
        paymentTypeId: selectedTransactions[0].paymentTypeId,
        description: values.description,
        reversed: true,
      },
      credits: [] as DebitCreditEntry[],
      debits: [] as DebitCreditEntry[],
    };

    if (submitType === "create") {
      selectedTransactions.forEach((selectedTransaction) => {
        if (selectedTransaction) {
          if (selectedTransaction.typeEnum === "CREDIT") {
            updatedValues.credits.push({
              id: selectedTransaction.id,
              glAccountId: selectedTransaction.glAccountId,
              amount: selectedTransaction.amount,
            } as DebitCreditEntry);
          } else if (selectedTransaction.typeEnum === "DEBIT") {
            updatedValues.debits.push({
              id: selectedTransaction.id,
              glAccountId: selectedTransaction.glAccountId,
              amount: selectedTransaction.amount,
            } as DebitCreditEntry);
          }
        }
      });

      insertGlJournalEntry(updatedValues, {
        onSuccess: () => {
          setSubmitLoader(false);

          toast({
            type: "success",
            response: `${PAGE_TITLE} ${submitTypeMessage} successfully.`,
          });
          form.resetFields();

          setIsModalOpen(false);

          // Close the modal after successful submission
          if (setOpen) {
            setOpen(false);
          }
        },
        onError(error, variables, context) {
          toast({ type: "error", response: error });
          setSubmitLoader(false);
        },
      });
    }
  }

  return (
    <Form
      layout="vertical"
      form={form}
      name={PAGE_TITLE}
      onFinish={onFinish}
      className="grid grid-cols-1 gap-1"
    >
      <Form.Item className="col-span-1" name="description" label="Comments">
        <Input.TextArea rows={5} />
      </Form.Item>

      <div className="col-span-1 ">
        <FormSubmitButtons submitLoader={submitLoader} onReset={onReset} />
      </div>
    </Form>
  );
}
