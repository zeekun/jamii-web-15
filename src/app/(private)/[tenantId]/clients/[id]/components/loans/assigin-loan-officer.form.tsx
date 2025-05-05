"use client";
import { useCreate, useGet } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { DatePicker, Form, Select } from "antd";
import { SetStateAction, useState } from "react";
import { toast } from "react-toastify";
import { PAGE_TITLE } from "./constants";
import { Employee } from "@/types";
import dayjs from "dayjs";
import { dateFormat } from "@/utils/dates";
import { filterOption } from "@/utils/strings";
import { useParams } from "next/navigation";

export default function AssignLoanOfficerForm(props: {
  id?: number;
  loanOfficerId?: number;
  setIsModalOpen: React.Dispatch<SetStateAction<boolean>>;
}) {
  const { tenantId } = useParams();
  const { id, loanOfficerId, setIsModalOpen } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);

  const { status: staffStatus, data: staff } = useGet<Employee[]>(
    `${tenantId}/staff`,
    [`${tenantId}/staff`]
  );

  let staffOptions: any = [];

  if (staffStatus === "success") {
    staffOptions = staff.map((s: Employee) => {
      return {
        value: s.id,
        label: `${s.firstName} ${s.middleName ? s.middleName : ""} ${
          s.lastName
        }`,
      };
    });
  }

  const { mutate: assignLoanOfficer } = useCreate(
    `${tenantId}/loan-officer-assignment-histories`,
    [`${tenantId}/loans`, `${id}`]
  );

  const onReset = () => {
    form.resetFields();
  };

  function onFinish(values: any) {
    setSubmitLoader(true);

    const updatedValues = {
      ...values,
      loanId: id,
    };

    assignLoanOfficer(
      { ...updatedValues },
      {
        onSuccess: () => {
          setSubmitLoader(false);
          toast.success(`Officer assigned to this loan successfully.`, {
            theme: "colored",
          });
          form.resetFields();
          setIsModalOpen(false);
        },
        onError(error, variables, context) {
          setSubmitLoader(false);
          toast.error(error.message, {
            theme: "colored",
          });
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
      <Form.Item
        className="col-span-2"
        name="loanOfficerId"
        label="To Loan Officer"
        initialValue={loanOfficerId}
        rules={[{ required: true, message: "To Loan Officer is required!" }]}
      >
        <Select
          showSearch
          allowClear
          filterOption={filterOption}
          options={staffOptions}
        />
      </Form.Item>

      <Form.Item
        className="col-span-2"
        name="startDate"
        label="Assignment Date"
        initialValue={dayjs()}
        rules={[{ required: true, message: "Assignment Date is required!" }]}
      >
        <DatePicker className="w-full" maxDate={dayjs()} format={dateFormat} />
      </Form.Item>
      <div className="col-span-2">
        <FormSubmitButtons submitLoader={submitLoader} onReset={onReset} />
      </div>
    </Form>
  );
}
