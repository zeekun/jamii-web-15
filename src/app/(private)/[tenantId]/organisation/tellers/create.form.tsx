"use client";
import { useCreate, useGet, useGetById, usePatch } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { Checkbox, DatePicker, Form, Input, Select } from "antd";
import { useEffect, useState } from "react";
import { ENDPOINT, PAGE_TITLE, QUERY_KEY } from "./constants";
import { Office, SubmitType, Teller } from "@/types";
import { useParams, useRouter } from "next/navigation";
import toast from "@/utils/toast";
import { filterOption } from "@/utils/strings";
import { dateFormat } from "@/utils/dates";
import dayjs from "dayjs";

export default function CreateForm(props: {
  submitType?: SubmitType;
  id?: number;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { tenantId } = useParams();
  const router = useRouter();
  const { submitType = "create", id, setIsModalOpen } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);

  const { mutate: insertTeller } = useCreate(`${tenantId}/${ENDPOINT}`, [
    `${tenantId}/${QUERY_KEY}`,
  ]);
  const { mutate: updateTeller } = usePatch(`${tenantId}/${ENDPOINT}`, id);

  const {
    status: tellerStatus,
    data: teller,
    error: tellerError,
  } = useGetById<Teller>(`${tenantId}/tellers`, id);

  const {
    status: officesStatus,
    data: offices,
    error: officesError,
  } = useGet<Office[]>(`${tenantId}/offices`, [`${tenantId}/offices`]);

  let officeOptions: any = [];

  if (officesStatus === "success") {
    officeOptions = offices.map((office: Office) => {
      return { value: office.id, label: office.name };
    });
  }

  useEffect(() => {
    if (submitType === "update" && tellerStatus === "success" && teller) {
      const { validTo, ...restTeller } = teller;

      const formValues = {
        ...restTeller,
        validFrom: teller.validFrom ? dayjs(teller.validFrom) : null,
        ...(validTo ? { validTo: dayjs(validTo) } : {}),
      };

      form.setFieldsValue(formValues);
    }
  }, [submitType, tellerStatus, teller, form]);

  const onReset = () => {
    form.resetFields();
  };

  function onFinish(values: any) {
    setSubmitLoader(true);

    // Remove `validTo` if it's null or undefined
    const { validTo, ...rest } = values;
    const updatedValues = validTo ? { ...rest, validTo } : { ...rest };

    const submitTypeMessage = submitType === "create" ? "created" : "updated";

    if (submitType === "create") {
      insertTeller(updatedValues, {
        onSuccess: (response: any) => {
          setSubmitLoader(false);
          toast({
            type: "success",
            response: `${PAGE_TITLE} ${submitTypeMessage} successfully.`,
          });
          form.resetFields();
          setIsModalOpen(false);
          router.push(`tellers/${response.id}`);
        },
        onError(error) {
          toast({ type: "error", response: error });
          setSubmitLoader(false);
        },
      });
    } else {
      updateTeller(
        { id, ...updatedValues },
        {
          onSuccess: () => {
            setSubmitLoader(false);
            setIsModalOpen(false);
            toast({
              type: "success",
              response: `${PAGE_TITLE} ${submitTypeMessage} successfully.`,
            });
          },
          onError(error) {
            toast({ type: "error", response: error });
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
      name={PAGE_TITLE}
      onFinish={onFinish}
      className="grid grid-cols-2 gap-2"
    >
      <Form.Item
        className="col-span-2"
        name="name"
        label="Teller Name"
        rules={[{ required: true, message: "Teller Name is required!" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        className="col-span-2"
        name="officeId"
        label="Office"
        rules={[{ required: true, message: "Office is required!" }]}
      >
        <Select
          allowClear
          showSearch
          filterOption={filterOption}
          options={officeOptions}
        />
      </Form.Item>

      <Form.Item className="col-span-2" name="description" label="Description">
        <Input.TextArea rows={2} />
      </Form.Item>

      <Form.Item
        className="col-span-1"
        label="Start Date"
        name={"validFrom"}
        rules={[{ required: true, message: "Start Date is required!" }]}
      >
        <DatePicker className="w-full" format={dateFormat} />
      </Form.Item>

      <Form.Item
        className="col-span-1"
        label="End Date"
        name={"validTo"}
        dependencies={["validFrom"]}
        rules={[
          ({ getFieldValue }) => ({
            validator(_, value) {
              const startDate = getFieldValue("validFrom");
              if (!value || !startDate || dayjs(value).isAfter(startDate)) {
                return Promise.resolve();
              }
              return Promise.reject(
                new Error("End Date must be after the Start Date!")
              );
            },
          }),
        ]}
      >
        <DatePicker className="w-full" format={dateFormat} />
      </Form.Item>

      <Form.Item
        className="col-span-2"
        name="status"
        label={" "}
        valuePropName="checked"
      >
        <Checkbox>Status </Checkbox>
      </Form.Item>

      <div className="col-span-2">
        <FormSubmitButtons submitLoader={submitLoader} onReset={onReset} />
      </div>
    </Form>
  );
}
