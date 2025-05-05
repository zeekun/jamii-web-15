"use client";
import { useCreate } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { Checkbox, Form, Input } from "antd";
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

  const { mutate: insertReport } = useCreate(ENDPOINT, [QUERY_KEY]);

  const onReset = () => {
    form.resetFields();
  };

  function onFinish(values: any) {
    setSubmitLoader(true);

    const submitTypeMessage = submitType === "create" ? "created" : "updated";

    if (submitType === "create") {
      insertReport(values, {
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
      className="grid grid-cols-6 gap-2"
    >
      <Form.Item
        className="col-span-2"
        name="accountType"
        label="Report Name"
        rules={[{ required: true, message: "Report Name is required!" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        className="col-span-2"
        name="reportType"
        label="Report Type"
        rules={[{ required: true, message: "Report Type is required!" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        className="col-span-2"
        name="reportSubType"
        label="Report Sub Type"
      >
        <Input />
      </Form.Item>

      <Form.Item
        className="col-span-3"
        name="reportCategory"
        label="Report Category"
      >
        <Input />
      </Form.Item>

      <Form.Item className="col-span-3" name="Description" label={" "}>
        <Checkbox>User Report (UI)</Checkbox>
      </Form.Item>

      <Form.Item className="col-span-3" name="description" label="Description">
        <Input.TextArea rows={4} />
      </Form.Item>

      <Form.Item
        className="col-span-3"
        name="sql"
        label="SQL"
        rules={[{ required: true, message: "SQL Type is required!" }]}
      >
        <Input.TextArea rows={4} />
      </Form.Item>

      <div className="col-span-6 ">
        <FormSubmitButtons submitLoader={submitLoader} onReset={onReset} />
      </div>
    </Form>
  );
}
