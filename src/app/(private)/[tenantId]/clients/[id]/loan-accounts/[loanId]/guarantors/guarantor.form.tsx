"use client";
import { useCreate, useGet, usePatchV2 } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { Checkbox, DatePicker, Form, Input, InputNumber, Select } from "antd";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { dateFormat } from "@/utils/dates";
import toast from "@/utils/toast";
import { Client, Code, CodeValue, Guarantor, Loan, SubmitType } from "@/types";
import { useParams } from "next/navigation";
import { filterOption } from "@/utils/strings";
import { CheckboxChangeEvent } from "antd/es/checkbox";

export default function GuarantorForm(props: {
  guarantor?: Guarantor;
  submitType?: SubmitType;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { submitType = "create", guarantor, setIsModalOpen } = props;
  const { tenantId, loanId } = useParams();
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);
  const [existingClient, setExistingClient] = useState(true);

  const { mutate: insertGuarantor } = useCreate(
    `${tenantId}/loans/${loanId}/guarantors`,
    [`${tenantId}/loans/${loanId}/guarantors`]
  );

  const { mutate: updateGuarantor } = usePatchV2(
    `${tenantId}/guarantors`,
    guarantor?.id,
    [`${tenantId}/loans/${loanId}/guarantors/`, `${guarantor?.id}`]
  );

  useEffect(() => {
    if (guarantor) {
      form.setFieldsValue({
        ...guarantor,
        dob: guarantor.dob ? dayjs(guarantor.dob) : null,
      });
      if (submitType === "update") {
        setExistingClient(guarantor.typeEnum !== "EXTERNAL");
      }
    }
  }, [guarantor, submitType, form]);

  const onReset = () => {
    form.resetFields();
  };

  const { status: clientsStatus, data: clients } = useGet<Client[]>(
    `${tenantId}/clients?filter={"where":{"statusEnum":"ACTIVE"}}`,
    [`${tenantId}/clients?filter={"where":{"statusEnum":"ACTIVE"}}`]
  );

  let clientsOptions: any = [];

  if (clientsStatus === "success") {
    clientsOptions = clients.map((client: Client) => {
      const name = client.firstName
        ? `${client.firstName} ${client.middleName || ""} ${client.lastName}`
        : client.fullName;
      return { value: client.id, label: name };
    });
  }

  const { status: guarantorRelationshipStatus, data: guarantorRelationships } =
    useGet<Code[]>(
      `${tenantId}/codes?filter={"where":{"name":"guarantor-relationship"}}`,
      [`${tenantId}/codes?filter={"where":{"name":"guarantor-relationship"}}`]
    );

  let guarantorRelationshipOptions: any = [];

  if (guarantorRelationshipStatus === "success") {
    if (guarantorRelationships[0]?.codeValues) {
      guarantorRelationshipOptions = guarantorRelationships[0]?.codeValues
        .sort((a: CodeValue, b: CodeValue) => a.orderPosition - b.orderPosition)
        .filter(
          (code: CodeValue) =>
            code.isActive && code.tenantId === Number(tenantId)
        )
        .map((code: CodeValue) => {
          return { value: code.id, label: code.codeValue };
        });
    }
  }

  function onFinish(values: any) {
    setSubmitLoader(true);

    let typeEnum;

    if (values.entityId) {
      typeEnum = "CUSTOMER";
    } else {
      typeEnum = "EXTERNAL";
    }

    // Remove null or empty values from the object
    const filteredValues = Object.fromEntries(
      Object.entries(values).filter(
        ([_, value]) => value !== null && value !== ""
      )
    );

    if (submitType === "create") {
      insertGuarantor(
        { ...values, typeEnum },
        {
          onSuccess: () => {
            setSubmitLoader(false);

            toast({
              type: "success",
              response: "Guarantor successfully added",
            });
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
    } else {
      console.log(filteredValues);
      updateGuarantor(
        { ...filteredValues, typeEnum },
        {
          onSuccess: () => {
            setSubmitLoader(false);

            toast({
              type: "success",
              response: "Guarantor successfully updated",
            });
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
  }

  const onChangeExistingClient = (value: CheckboxChangeEvent) => {
    setExistingClient(!existingClient);
  };

  return (
    <Form
      layout="vertical"
      form={form}
      name={"guarantorForm"}
      onFinish={onFinish}
      className="grid grid-cols-2 gap-2"
    >
      <>
        <Form.Item
          className="col-span-1 flex justify-start items-baseline"
          name="isActive"
          label={" "}
          valuePropName="checked"
          initialValue={existingClient}
        >
          <Checkbox onChange={onChangeExistingClient}>
            Existing Client?
          </Checkbox>
        </Form.Item>

        <Form.Item
          className="col-span-1"
          name="relationshipId"
          label="Relationship"
        >
          <Select
            allowClear
            showSearch
            filterOption={filterOption}
            options={guarantorRelationshipOptions}
          />
        </Form.Item>

        {existingClient ? (
          <>
            <Form.Item
              className="col-span-2"
              name="entityId"
              label="Name"
              rules={[{ required: true, message: "Name is required!" }]}
            >
              <Select
                allowClear
                showSearch
                filterOption={filterOption}
                options={clientsOptions}
              />
            </Form.Item>
          </>
        ) : (
          <>
            <Form.Item
              className="col-span-1"
              name="firstName"
              label="First Name"
              rules={[{ required: true, message: "First Name is required!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              className="col-span-1"
              name="lastName"
              label="Last Name"
              rules={[{ required: true, message: "Last Name is required!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              className="col-span-1"
              name="middleName"
              label="Middle Name"
            >
              <Input />
            </Form.Item>
            <Form.Item className="col-span-1" name="dob" label="DOB">
              <DatePicker
                className="w-full"
                format={dateFormat}
                maxDate={dayjs()}
              />
            </Form.Item>
            <Form.Item
              className="col-span-1"
              name="addressLine1"
              label="Address Line 1"
            >
              <Input />
            </Form.Item>

            <Form.Item className="col-span-1" name="city" label="City">
              <Input />
            </Form.Item>

            <Form.Item
              className="col-span-1"
              name="mobileNumber"
              label="Mobile"
            >
              <Input />
            </Form.Item>
            <Form.Item
              className="col-span-1"
              name="housePhoneNumber"
              label="Mobile 2"
            >
              <Input />
            </Form.Item>
            <Form.Item className="col-span-2" name="comment" label="Comment">
              <Input.TextArea rows={5} />
            </Form.Item>
          </>
        )}

        {/* <Form.Item
          className="col-span-2"
          name="description"
          label="Description"
        >
          <Input.TextArea rows={5} />
        </Form.Item> */}
      </>

      <div className="col-span-2">
        <FormSubmitButtons submitLoader={submitLoader} onReset={onReset} />
      </div>
    </Form>
  );
}
