"use client";
import { useCreate, useGet, useGetById, usePatch, usePatchV2 } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { Checkbox, DatePicker, Form, Input, Select } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { ENDPOINT, PAGE_TITLE, QUERY_KEY } from "./constants";
import { Client, Employee, Group, Office, SubmitType } from "@/types";
import { filterOption } from "@/utils/strings";
import toast from "@/utils/toast";
import { dateFormat } from "@/utils/dates";
import { useParams, useRouter } from "next/navigation";

export default function CreateForm(props: {
  submitType?: SubmitType;
  id?: number;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { tenantId } = useParams();
  const { submitType = "create", id, setIsModalOpen } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);
  const [selectedOfficeId, setSelectedOfficeId] = useState<string | null>(null); // Track selected office ID
  const router = useRouter();
  const { mutate: insertGroup } = useCreate(`${tenantId}/${ENDPOINT}`, [
    QUERY_KEY,
  ]);
  const { mutate: updateGroup } = usePatchV2(`${tenantId}/${ENDPOINT}`, id, [
    `${tenantId}/${id}`,
  ]);

  const onReset = () => {
    form.resetFields();
  };

  const {
    status: officesStatus,
    data: offices,
    error: officesError,
  } = useGet<Office[]>(`${tenantId}/offices`, [`${tenantId}/offices`]);

  let selectOfficeOptions: any = [];

  if (officesStatus === "success") {
    selectOfficeOptions = offices.map((office: Office) => {
      return { value: office.id, label: office.name };
    });
  }

  // Fetch staff based on the selected office ID
  const {
    status: staffStatus,
    data: staff,
    error: staffError,
    refetch: refetchStaff,
  } = useGet<Employee[]>(
    `${tenantId}/staff?filter={"where":{"and":[{"officeId":"${selectedOfficeId}"},{"isActive":true}]}}`, // Only fetch if office ID is selected
    [
      `${tenantId}/staff?filter={"where":{"and":[{"officeId":"${selectedOfficeId}"},{"isActive":true}]}}`,
      `${selectedOfficeId}`,
    ]
  );

  let staffOptions: any = [];

  if (staffStatus === "success") {
    console.log(staff);
    staffOptions = staff.map((st: Employee) => {
      const c = `${st.firstName} ${st.middleName || ""} ${st.lastName}`;

      return {
        value: st.id,
        label: c,
      };
    });
  }

  // Fetch clients based on the selected office ID
  const {
    status: clientsStatus,
    data: clients,
    error: clientsError,
    refetch: refetchClients, // Add refetch function
  } = useGet<Client[]>(
    `${tenantId}/clients?filter={"where":{"and":[{"statusEnum":"ACTIVE"},{"officeId":"${selectedOfficeId}"}]}}`, // Only fetch if office ID is selected
    [
      `${tenantId}/clients?filter={"where":{"and":[{"statusEnum":"ACTIVE"},{"officeId":"${selectedOfficeId}"}]}}`,
      `${selectedOfficeId}`,
    ]
  );

  let clientOptions: any = [];

  if (clientsStatus === "success") {
    clientOptions = clients.map((client: Client) => {
      const c = client.firstName
        ? `${client.firstName} ${client.middleName || ""} ${client.lastName}`
        : client.fullName;
      return {
        value: client.id,
        label: `#${client.accountNo} - ${c} - ${client.office.name}`,
      };
    });
  }

  const {
    status: groupStatus,
    data: group,
    error: groupError,
  } = useGetById<Group>(`${tenantId}/${ENDPOINT}`, id);

  useEffect(() => {
    if (submitType === "update" && groupStatus === "success" && group) {
      // Map client IDs to their corresponding options
      const clients = group.clients?.map((client) => {
        const clientOption = clientOptions.find(
          (option: any) => option.value === client.id
        );
        const c = client.firstName
          ? `${client.firstName} ${client.middleName || ""} ${client.lastName}`
          : client.fullName;

        return clientOption
          ? clientOption
          : {
              value: Number(client.id),
              label: `#${client.accountNo} - ${c} - ${client.office?.name}`,
            };
      });

      form.setFieldsValue({
        ...group,
        submittedOnDate:
          group.submittedOnDate &&
          (dayjs(group.submittedOnDate) as unknown as string),
        clients: clients || [], // Set the mapped clients
      });
    }
  }, [submitType, groupStatus, group, form, clientOptions]); // Add clientOptions to dependencies

  // Refetch staff and clients when the selected office ID changes
  useEffect(() => {
    if (selectedOfficeId) {
      refetchStaff();
      refetchClients();
    }
  }, [selectedOfficeId, refetchStaff, refetchClients]);

  function onFinish(values: any) {
    setSubmitLoader(true);

    // Extract client IDs from the selected clients
    const clientIds = values.clients?.map((client: any) => {
      if (typeof client === "object" && client.value) {
        return client.value; // Extract the ID if client is an object
      }
      return client; // Otherwise, assume it's already an ID
    });

    const updatedValues = {
      group: {
        ...values,
      },
      clients: clientIds || [], // Ensure clients is always an array of IDs
    };

    delete updatedValues["group"]["clients"];

    const submitTypeMessage = submitType === "create" ? "created" : "updated";

    if (submitType === "create") {
      insertGroup(updatedValues, {
        onSuccess: (response: any) => {
          setSubmitLoader(false);

          toast({
            type: "success",
            response: `${PAGE_TITLE} ${submitTypeMessage} successfully.`,
          });
          form.resetFields();

          setIsModalOpen(false);
          router.push(`/${tenantId}/groups/${response.id}`);
        },
        onError(error, variables, context) {
          toast({ type: "error", response: error });

          setSubmitLoader(false);
        },
      });
    } else {
      updateGroup(updatedValues, {
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
          onChange={(value) => setSelectedOfficeId(value)} // Update selected office ID
        />
      </Form.Item>

      <Form.Item className="col-span-1" name="staffId" label="Staff">
        <Select
          allowClear
          showSearch
          filterOption={filterOption}
          options={staffOptions}
          disabled={!selectedOfficeId} // Disable if no office is selected
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

      <Form.Item className="col-span-2" name="clients" label="Add Clients">
        <Select
          mode="multiple"
          allowClear
          showSearch
          filterOption={filterOption}
          options={clientOptions}
          disabled={!selectedOfficeId} // Disable if no office is selected
        />
      </Form.Item>

      <div className="col-span-2 ">
        <FormSubmitButtons submitLoader={submitLoader} onReset={onReset} />
      </div>
    </Form>
  );
}
