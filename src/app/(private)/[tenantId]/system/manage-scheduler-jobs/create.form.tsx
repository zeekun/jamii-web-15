"use client";
import { useCreate } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { Form, Input } from "antd";
import { useState } from "react";
import { toast } from "react-toastify";
import { ENDPOINT, PAGE_TITLE, QUERY_KEY } from "./constants";
import { SubmitType } from "@/types";
import { useParams } from "next/navigation";

const Create = (props: {
  submitType?: SubmitType;
  id?: number;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { tenantId } = useParams();
  const { submitType = "create", id, setIsModalOpen } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);

  const { mutate: insertFund } = useCreate(`${tenantId}/start-cron`, [
    QUERY_KEY,
  ]);

  const onReset = () => {
    form.resetFields();
  };

  function onFinish(values: any) {
    setSubmitLoader(true);

    const submitTypeMessage = submitType === "create" ? "created" : "updated";

    if (submitType === "create") {
      insertFund(values, {
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
        className="col-span-3"
        name="accountType"
        label="Account Type"
        rules={[{ required: true, message: "Account Type is required!" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        className="col-span-3"
        name="accountType"
        label="Prefix Field"
        rules={[{ required: true, message: "Prefix Field is required!" }]}
      >
        <Input />
      </Form.Item>

      <div className="col-span-6 ">
        <FormSubmitButtons submitLoader={submitLoader} onReset={onReset} />
      </div>
    </Form>
  );
};

export default Create;
