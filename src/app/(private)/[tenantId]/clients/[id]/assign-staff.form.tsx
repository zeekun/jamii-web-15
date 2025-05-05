"use client";
import { useGet, usePatch } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { DatePicker, Form, Select } from "antd";
import { useState } from "react";
import { PAGE_TITLE } from "../constants";
import toast from "@/utils/toast";
import { Client, Employee, Group, SavingsAccount } from "@/types";
import { filterOption } from "@/utils/strings";
import { useParams } from "next/navigation";
import { dateFormat } from "@/utils/dates";
import dayjs from "dayjs";

export default function AssignStaffForm(props: {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  client: Client | Group;
  saving?: SavingsAccount;
  type?: "client" | "group";
}) {
  const { tenantId } = useParams();
  const { client, saving, setIsModalOpen, type } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);

  const entity = client; // Dynamically refer to client or group
  let id = entity?.id;
  let qk = [`${tenantId}/${type === "group" ? "groups" : "clients"}`, `${id}`];
  let endpoint = `${type === "group" ? "groups" : "clients"}`;

  if (saving) {
    endpoint = "savings-accounts";
    id = saving.id;
  }

  const { mutate: assignStaff } = usePatch(`${tenantId}/${endpoint}`, id, qk);

  const onReset = () => {
    form.resetFields();
  };

  function onFinish(values: any) {
    setSubmitLoader(true);

    let staffId = entity?.staff || saving?.fieldOfficer ? null : values.staffId;

    // Construct updated values
    let updatedValues: any;

    if (type === "group" && "name" in entity) {
      updatedValues = {
        group: {
          ...values,
          name: entity.name,
          submittedOnDate: entity.submittedOnDate,
          officeId: entity.officeId,
          statusEnum: entity.statusEnum,
          staffId,
        },
      };
    } else {
      updatedValues = {
        client: {
          ...values,
          officeId: entity?.officeId,
          staffId,
          ...(entity?.hasOwnProperty("legalFormEnum") && {
            legalFormEnum: (entity as Client).legalFormEnum,
          }),
        },
      };
    }

    // Call API
    assignStaff(
      { id, ...updatedValues },
      {
        onSuccess: () => {
          setSubmitLoader(false);
          const response = saving
            ? "Savings Account"
            : `${type === "client" ? "Client" : "Group"}`;
          const assigned = saving?.fieldOfficerId
            ? "unassigned from"
            : "assigned to";
          toast({
            type: "success",
            response: `${response} ${assigned} staff successfully`,
          });
          setIsModalOpen(false);
        },
        onError(error) {
          setSubmitLoader(false);
          toast({ type: "error", response: error });
        },
      }
    );
  }

  // Determine the officeId
  let officeId =
    entity?.officeId || saving?.client?.officeId || saving?.group?.officeId;

  const { status: staffStatus, data: staff } = useGet<Employee[]>(
    `${tenantId}/staff?filter={"where":{"officeId":${officeId},"isActive":true}}`,
    [
      `${tenantId}/staff?filter={"where":{"officeId":${officeId},"isActive":true}}`,
    ]
  );

  // Format staff options for dropdown
  const staffOptions: any =
    staffStatus === "success"
      ? staff.map((st: Employee) => ({
          value: st.id,
          label: `${st.firstName} ${st.middleName || ""} ${st.lastName}`,
        }))
      : [];

  return (
    <Form
      layout="vertical"
      form={form}
      name={PAGE_TITLE}
      onFinish={onFinish}
      className="grid grid-cols-2 gap-2"
    >
      {!entity?.staff && !saving?.fieldOfficer ? (
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

      <div className="col-span-2">
        <FormSubmitButtons submitLoader={submitLoader} onReset={onReset} />
      </div>
    </Form>
  );
}
