"use client";
import { useCreate, useGet, useGetById, usePatch } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { Checkbox, DatePicker, Form, Input, Select } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { ENDPOINT, PAGE_TITLE, QUERY_KEY } from "./constants";
import { Center, Employee, Group, Office, SubmitType } from "@/types";
import { filterOption } from "@/utils/strings";
import toast from "@/utils/toast";
import { dateFormat } from "@/utils/dates";

export default function CreateForm(props: {
  submitType?: SubmitType;
  id?: number;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { submitType = "create", id, setIsModalOpen } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);

  const { mutate: insertCenter } = useCreate(ENDPOINT, [QUERY_KEY]);
  const { mutate: updateCenter } = usePatch(ENDPOINT, id, [QUERY_KEY]);

  const onReset = () => {
    form.resetFields();
  };

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

  const {
    status: staffStatus,
    data: staff,
    error: staffError,
  } = useGet<Employee[]>("staff", ["staff"]);

  let staffOptions: any = [];

  if (staffStatus === "success") {
    staffOptions = staff.map((st: Employee) => {
      const c = `${st.firstName} ${st.middleName || ""} ${st.lastName}`;

      return {
        value: st.id,
        label: c,
      };
    });
  }

  const {
    status: groupsStatus,
    data: groups,
    error: groupsError,
  } = useGet<Group[]>("groups", ["groups"]);

  let groupOptions: any = [];

  if (groupsStatus === "success") {
    groupOptions = groups.map((group: Group) => {
      const c = group.name;

      return {
        value: group.id,
        label: `#${group.accountNo} - ${c} - ${group.office.name}`,
      };
    });
  }

  const {
    status: centerStatus,
    data: center,
    error: centerError,
  } = useGetById<Center>(ENDPOINT, id);

  useEffect(() => {
    if (submitType === "update" && centerStatus === "success" && center) {
      let groups = center.groups?.map((group) => {
        return group.id;
      });
      form.setFieldsValue({
        ...center,
        submittedOnDate:
          center.submittedOnDate &&
          (dayjs(center.submittedOnDate) as unknown as string),
        groups,
      });
    }
  }, [submitType, centerStatus, center, form]);

  function onFinish(values: any) {
    setSubmitLoader(true);

    const updatedValues = {
      center: values,
      groups: values.groups,
    };

    delete updatedValues["center"]["groups"];

    const submitTypeMessage = submitType === "create" ? "created" : "updated";

    if (submitType === "create") {
      insertCenter(updatedValues, {
        onSuccess: () => {
          setSubmitLoader(false);

          toast({
            type: "success",
            response: `${PAGE_TITLE} ${submitTypeMessage} successfully.`,
          });
          form.resetFields();
        },
        onError(error, variables, context) {
          toast({ type: "error", response: error });

          setSubmitLoader(false);
        },
      });
    } else {
      updateCenter(updatedValues, {
        onSuccess: () => {
          setSubmitLoader(false);

          toast({
            type: "success",
            response: `${PAGE_TITLE} ${submitTypeMessage} successfully.`,
          });
          form.resetFields();
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
      className="grid grid-cols-2 gap-2"
    >
      <Form.Item
        className="col-span-1"
        name="name"
        label="Name"
        rules={[{ required: true, message: "Name is required!" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        className="col-span-1"
        name="officeId"
        label="Office"
        rules={[{ required: true, message: "Office is required!" }]}
      >
        <Select
          allowClear
          showSearch
          filterOption={filterOption}
          options={selectOfficeOptions}
        />
      </Form.Item>

      <Form.Item className="col-span-1" name="staffId" label="Staff">
        <Select
          allowClear
          showSearch
          filterOption={filterOption}
          options={staffOptions}
        />
      </Form.Item>

      <Form.Item
        label="Submitted On"
        className="col-span-1"
        name="submittedOnDate"
        rules={[{ required: true, message: "Submitted On is required!" }]}
        initialValue={dayjs()}
      >
        <DatePicker className="w-full" maxDate={dayjs()} format={dateFormat} />
      </Form.Item>

      <Form.Item
        className="col-span-1 flex justify-start items-baseline"
        name="isActive"
        label={" "}
        valuePropName="checked"
      >
        <Checkbox>Active</Checkbox>
      </Form.Item>

      <Form.Item className="col-span-1" name="externalId" label="External Id">
        <Input />
      </Form.Item>

      <Form.Item className="col-span-2" name="groups" label="Add Groups">
        <Select
          mode="multiple"
          allowClear
          showSearch
          filterOption={filterOption}
          options={groupOptions}
        />
      </Form.Item>

      <div className="col-span-2 ">
        <FormSubmitButtons submitLoader={submitLoader} onReset={onReset} />
      </div>
    </Form>
  );
}
