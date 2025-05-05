"use client";
import { useGet, usePatch } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { DatePicker, Form, Select } from "antd";
import { useState } from "react";
import { PAGE_TITLE } from "../constants";
import toast from "@/utils/toast";
import { Group, Employee, SavingsAccount } from "@/types";
import { filterOption } from "@/utils/strings";
import { useParams } from "next/navigation";
import { dateFormat } from "@/utils/dates";

export default function AssignStaffForm(props: {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  group?: Group;
  saving?: SavingsAccount;
}) {
  const { tenantId } = useParams();
  const { group, saving, setIsModalOpen } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);

  let id = group?.id;

  let qk = [`${tenantId}/groups`, `${id}`];
  let endpoint = `${tenantId}/groups`;

  if (saving) {
    endpoint = "savings-accounts";
    id = saving.id;
  }

  const { mutate: assignStaff } = usePatch(`${endpoint}`, id, qk);

  const onReset = () => {
    form.resetFields();
  };

  function onFinish(values: any) {
    setSubmitLoader(true);

    let staffId;

    if (group?.staff || saving?.fieldOfficer) {
      staffId = null;
    } else {
      staffId = values.staffId;
    }

    let updatedValues;
    let updatedClientValues = {
      group: {
        ...values,
        name: group?.name,
        submittedOnDate: group?.submittedOnDate,
        statusEnum: group?.statusEnum,
        officeId: group?.officeId,
        staffId,
      },
    };

    const updatedSavingAccountValues = {
      savingsAccount: {
        statusEnum: saving?.statusEnum,
        fieldOfficerId: staffId,
      },
      assignStaff: {
        fieldOfficerId: Number(staffId),
        endDate: values.endDate,
      },
    };

    if (group) {
      updatedValues = updatedClientValues;
    } else if (saving) {
      updatedValues = updatedSavingAccountValues;
    }

    assignStaff(
      { id, ...updatedValues },
      {
        onSuccess: () => {
          setSubmitLoader(false);
          const response = saving ? `Savings Account` : "group";
          const assigned = saving?.fieldOfficerId
            ? `un-assigned from`
            : "assigned to";
          toast({
            type: "success",
            response: `${response} ${assigned} staff successfully`,
          });
          setIsModalOpen(false);
        },
        onError(error, variables, context) {
          setSubmitLoader(false);
          toast({
            type: "error",
            response: error,
          });
        },
      }
    );
  }

  let officeId = group?.officeId;

  const {
    status: staffStatus,
    data: staff,
    error: staffError,
  } = useGet<Employee[]>(
    `${tenantId}/staff?filter={"where":{"officeId":${officeId},"isActive":true}}`,
    [
      `${tenantId}/staff?filter={"where":{"officeId":${officeId},"isActive":true}}`,
    ]
  );

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

  return (
    <Form
      layout="vertical"
      form={form}
      name={PAGE_TITLE}
      onFinish={onFinish}
      className="grid grid-cols-2 gap-2"
    >
      <>
        {!group?.staff && !saving?.fieldOfficer ? (
          <Form.Item
            className="col-span-2"
            name="staffId"
            label="Staff"
            rules={[{ required: true, message: "Staff is required!" }]}
          >
            <Select
              allowClear
              showSearch
              filterOption={filterOption}
              options={staffOptions}
            />
          </Form.Item>
        ) : (
          <Form.Item
            className="col-span-2"
            name="endDate"
            label="Unassigned On"
            rules={[{ required: true, message: "Unassigned On is required!" }]}
          >
            <DatePicker className="w-full" format={dateFormat} />
          </Form.Item>
        )}
      </>

      <div className="col-span-2">
        <FormSubmitButtons submitLoader={submitLoader} onReset={onReset} />
      </div>
    </Form>
  );
}
