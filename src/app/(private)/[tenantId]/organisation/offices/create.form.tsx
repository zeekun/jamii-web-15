"use client";
import { useCreate, useGet, useGetById, usePatch } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { Office, SubmitType } from "@/types";
import { dateFormat } from "@/utils/dates";
import toast from "@/utils/toast";
import { DatePicker, Form, Input, Select } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { ENDPOINT, PAGE_TITLE, QUERY_KEY } from "./constants";
import { useParams } from "next/navigation";
import { filterOption } from "@/utils/strings";

export default function CreateForm(props: {
  submitType?: SubmitType;
  id?: number;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { tenantId } = useParams();
  const { submitType = "create", id, setIsModalOpen } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);

  const {
    status: parentOfficesStatus,
    data: parentOffices,
    error,
  } = useGet<Office[]>(`${tenantId}/${ENDPOINT}`, [`${tenantId}/${QUERY_KEY}`]);

  let selectOfficeOptions: any = [];

  if (parentOfficesStatus === "success") {
    selectOfficeOptions = parentOffices
      .filter((o) => o.id !== id)
      .map((office: Office) => {
        return { value: office.id, label: office.name };
      });
  }

  const { mutate: insertOffice } = useCreate(`${tenantId}/${ENDPOINT}`, [
    `${tenantId}/${QUERY_KEY}`,
  ]);
  const { mutate: updateOffice } = usePatch(`${tenantId}/${ENDPOINT}`, id, [
    `${tenantId}/${QUERY_KEY}`,
  ]);

  const {
    status: officeStatus,
    data: office,
    error: officeError,
  } = useGetById<Office>(
    `${tenantId}/${ENDPOINT}`,
    id,
    "?filter[include][]=parent"
  );

  useEffect(() => {
    if (submitType === "update" && officeStatus === "success" && office) {
      form.setFieldsValue({
        ...office,
        openingDate: office.openingDate ? dayjs(office.openingDate) : null,
      });
    }
  }, [submitType, officeStatus, office, form]);

  const onReset = () => {
    form.resetFields();
  };

  function onFinish(values: any) {
    setSubmitLoader(true);

    if (!values.parentId) delete values.parentId;
    if (!values.externalId) delete values.externalId;
    if (!values.hierarchy) delete values.hierarchy;

    const updatedValues: any = {
      office: {
        ...values,
        email: values.email ? values.email : "",
        phoneNumber: values.phoneNumber ? values.phoneNumber : "",
      },
    };
    // let phoneNumbers: any[] = [];
    // let emails: any[] = [];
    // if (values.phoneNumber) {
    //   phoneNumbers.push({ number: values.phoneNumber });
    // }
    // if (values.email) {
    //   emails.push({ email: values.email });
    // }
    // updatedValues["phoneNumbers"] = phoneNumbers;
    // updatedValues["emails"] = emails;
    // delete updatedValues["office"]["email"];
    // delete updatedValues["office"]["phoneNumber"];

    const submitTypeMessage = submitType === "create" ? "created" : "updated";

    if (submitType === "create") {
      insertOffice(updatedValues, {
        onSuccess: () => {
          setSubmitLoader(false);
          setIsModalOpen(false);
          toast({
            response: `${PAGE_TITLE} ${submitTypeMessage} successfully.`,
            type: "success",
          });

          form.resetFields();
        },
        onError(error: any, variables, context) {
          toast({ response: error, type: "error" });
          setSubmitLoader(false);
        },
      });
    } else {
      console.log(updatedValues);
      updateOffice(
        { id, ...updatedValues },
        {
          onSuccess: () => {
            setSubmitLoader(false);
            setIsModalOpen(false);
            toast({
              response: `${PAGE_TITLE} ${submitTypeMessage} successfully.`,
              type: "success",
            });
          },
          onError(error, variables, context) {
            toast({ response: error, type: "error" });
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
      style={{ maxWidth: 600 }}
    >
      <Form.Item
        name="name"
        label="Office"
        rules={[{ required: true, message: "Office Name is required!" }]}
      >
        <Input
          disabled={
            submitType === "update" && office && office.name === "Head Office"
              ? true
              : false
          }
        />
      </Form.Item>

      {submitType === "update" &&
      office &&
      office.name === "Head Office" ? null : (
        <Form.Item
          name="parentId"
          label="Parent Office"
          rules={[{ required: true, message: "Parent Office is required!" }]}
        >
          <Select
            options={selectOfficeOptions}
            allowClear
            showSearch
            filterOption={filterOption}
          />
        </Form.Item>
      )}

      <Form.Item
        label="Date Opened"
        name="openingDate"
        rules={[{ required: true, message: "Date Opened is required!" }]}
      >
        <DatePicker
          disabled={submitType === "update" && office?.offices ? true : false}
          className="w-full"
          maxDate={dayjs()}
          format={dateFormat}
        />
      </Form.Item>

      <Form.Item name="email" label="Email" rules={[{ type: "email" }]}>
        <Input />
      </Form.Item>

      <Form.Item className="col-span-1" name="phoneNumber" label="Phone Number">
        <Input
          className="w-full"
          minLength={10}
          maxLength={10}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "");
            form.setFieldsValue({ mobileNo2: value });
          }}
        />
      </Form.Item>

      <FormSubmitButtons submitLoader={submitLoader} onReset={onReset} />
    </Form>
  );
}
