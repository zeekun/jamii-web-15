"use client";
import { useCreate } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { DatePicker, Form, Input } from "antd";
import { useState } from "react";
import { toast } from "react-toastify";
import { ENDPOINT, PAGE_TITLE, QUERY_KEY } from "./constants";
import { SubmitType } from "@/types";

export default function CreateForm(props: {
  submitType?: SubmitType;
  id?: number;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { submitType = "create", id, setIsModalOpen } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);

  const { mutate: insertHoliday } = useCreate(ENDPOINT, [QUERY_KEY]);

  const onReset = () => {
    form.resetFields();
  };

  function onFinish(values: any) {
    setSubmitLoader(true);

    const submitTypeMessage = submitType === "create" ? "created" : "updated";

    if (submitType === "create") {
      insertHoliday(values, {
        onSuccess: () => {
          setSubmitLoader(false);
          //setOpen(false);
          toast.success(`${PAGE_TITLE} ${submitTypeMessage} successfully.`, {
            theme: "colored",
          });
          form.resetFields();
        },
        onError(error, variables, context) {
          toast.error(error.message, {
            theme: "colored",
          });

          setSubmitLoader(false);
        },
      });
    } else {
      // updateSchedule(
      //   { id, ...values },
      //   {
      //     onSuccess: () => {
      //       setSubmitLoader(false);
      //       setOpen(false);
      //       toast({
      //         title: "Success",
      //         description: `${PAGE_TITLE} ${submitTypeMessage} successfully`,
      //         variant: "success",
      //       });
      //     },
      //     onError(error, variables, context) {
      //       toast({
      //         title: "Error",
      //         description: error.message,
      //         variant: "destructive",
      //       });
      //       setSubmitLoader(false);
      //     },
      //   }
      // );
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
      <Form.Item
        className="col-span-2"
        name="currency"
        label="Office"
        rules={[{ required: true, message: "Office is required!" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        className="col-span-2"
        name="assignmentDate"
        label="Assignment Date"
        rules={[{ required: true, message: "Assignment Date is required!" }]}
      >
        <DatePicker className="w-full" />
      </Form.Item>

      <Form.Item
        className="col-span-2"
        name="assignmentDate"
        label="To Loan Officer"
        rules={[{ required: true, message: "To Loan Officer is required!" }]}
      >
        <Input />
      </Form.Item>

      <div className="col-span-2">
        <FormSubmitButtons submitLoader={submitLoader} onReset={onReset} />
      </div>
    </Form>
  );
}
