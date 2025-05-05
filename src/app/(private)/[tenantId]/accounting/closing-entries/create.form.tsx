"use client";
import { useCreate, useGet, useGetById, usePatch } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { GLClosure, Office, SubmitType } from "@/types";
import { dateFormat } from "@/utils/dates";
import { filterOption } from "@/utils/strings";
import { DatePicker, Form, Input, Select } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ENDPOINT, PAGE_TITLE, QUERY_KEY } from "./constants";

export default function CreateForm(props: {
  submitType?: SubmitType;
  id?: number;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { submitType = "create", id, setIsModalOpen } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);

  const {
    status: officesStatus,
    data: offices,
    error: officesError,
  } = useGet<Office[]>("offices", ["offices"]);

  let selectOfficeOptions: any = [];

  if (officesStatus === "success") {
    selectOfficeOptions = offices.map((office: Office) => {
      return { value: office.id, label: office.name };
    });
  }

  const { mutate: insertGLClosure } = useCreate(ENDPOINT, [QUERY_KEY]);
  const { mutate: updateGLClosure } = usePatch(ENDPOINT, id, [QUERY_KEY]);

  const onReset = () => {
    form.resetFields();
  };

  const {
    status: glClosureStatus,
    data: glClosure,
    error: glClosureError,
  } = useGetById<GLClosure>(ENDPOINT, id);

  useEffect(() => {
    if (submitType === "update" && glClosureStatus === "success" && glClosure) {
      form.setFieldsValue({
        closingDate: dayjs(glClosure.closingDate),
        officeId: glClosure.officeId,
        comments: glClosure.comments,
      });
    }
  }, [submitType, glClosureStatus, glClosure, form]);

  function onFinish(values: any) {
    setSubmitLoader(true);

    const submitTypeMessage = submitType === "create" ? "created" : "updated";

    if (submitType === "create") {
      insertGLClosure(values, {
        onSuccess: () => {
          setSubmitLoader(false);
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
      updateGLClosure(
        { id, ...values },
        {
          onSuccess: () => {
            setSubmitLoader(false);
            setIsModalOpen(false);

            toast.success(`${PAGE_TITLE} ${submitTypeMessage} successfully.`, {
              theme: "colored",
            });
          },
          onError(error, variables, context) {
            toast.success(`${PAGE_TITLE} ${submitTypeMessage} successfully.`, {
              theme: "colored",
            });
            setSubmitLoader(false);
          },
        }
      );
    }
  }

  return (
    <Form
      layout="vertical"
      form={form}
      name={`${PAGE_TITLE}${id}`}
      onFinish={onFinish}
      className="grid grid-cols-2 gap-2"
    >
      <Form.Item
        className="col-span-2"
        name="officeId"
        label="Office"
        rules={[{ required: true, message: "Office is required!" }]}
      >
        <Select
          options={selectOfficeOptions}
          allowClear
          filterOption={filterOption}
          showSearch
        />
      </Form.Item>

      <Form.Item
        className="col-span-2"
        name="closingDate"
        label="Closing Date"
        rules={[{ required: true, message: "Closing Date is required!" }]}
      >
        <DatePicker className="w-full" maxDate={dayjs()} format={dateFormat} />
      </Form.Item>

      <Form.Item className="col-span-2" name="comments" label="Comments">
        <Input.TextArea rows={4} />
      </Form.Item>

      <div className="col-span-2">
        <FormSubmitButtons submitLoader={submitLoader} onReset={onReset} />
      </div>
    </Form>
  );
}
