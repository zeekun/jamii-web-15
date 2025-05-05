"use client";
import { PlusOutlined } from "@ant-design/icons";
import { Button, Checkbox, DatePicker, Form, Input, Modal, Select } from "antd";
import { SetStateAction, useState } from "react";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { Client, Code, CodeValue, FamilyMember, SubmitType } from "@/types";
import dayjs from "dayjs";
import { useGet } from "@/api";
import { filterOption } from "@/utils/strings";
import { dateFormat } from "@/utils/dates";
import { useParams } from "next/navigation";

export default function CreateFamilyMemberModal(props: {
  submitType: SubmitType;
  formValues: Partial<Client>;
  setFormValues: React.Dispatch<SetStateAction<Partial<Client>>>;
  familyMembersData: FamilyMember[];
  setFamilyMembersData: React.Dispatch<SetStateAction<FamilyMember[]>>;
}) {
  const { tenantId } = useParams();
  const {
    submitType,
    formValues,
    setFormValues,
    familyMembersData,
    setFamilyMembersData,
  } = props;
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);

  const onReset = () => {
    form.resetFields();
  };

  const showModal = () => {
    setOpen(true);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  function onFinish(values: any) {
    const newFamilyMember = {
      ...values,
    };

    setFamilyMembersData([...familyMembersData, newFamilyMember]);
    setFormValues({
      ...formValues,
      familyMembers: [...(formValues.familyMembers || []), newFamilyMember],
    });

    form.resetFields();
    setOpen(false);
  }

  const { status: maritalStatusesStatus, data: maritalStatuses } = useGet<
    Code[]
  >(`${tenantId}/codes?filter={"where":{"name":"marital-status"}}`, [
    `${tenantId}/codes?filter={"where":{"name":"marital-status"}}`,
  ]);

  let maritalStatusesOptions: any = [];

  if (maritalStatusesStatus === "success") {
    if (maritalStatuses[0]?.codeValues) {
      maritalStatusesOptions = maritalStatuses[0]?.codeValues
        .sort((a: CodeValue, b: CodeValue) => a.orderPosition - b.orderPosition)
        .filter(
          (code: CodeValue) =>
            code.isActive && code.tenantId === Number(tenantId)
        )
        .map((code: CodeValue) => ({
          value: code.id,
          label: code.codeValue,
        }));
    }
  }

  const { status: professionsStatus, data: professions } = useGet<Code[]>(
    `${tenantId}/codes?filter={"where":{"name":"profession"}}`,
    [`${tenantId}/codes?filter={"where":{"name":"profession"}}`]
  );

  let professionsOptions: any = [];

  if (professionsStatus === "success") {
    if (professions[0]?.codeValues) {
      professionsOptions = professions[0]?.codeValues
        .sort((a: CodeValue, b: CodeValue) => a.orderPosition - b.orderPosition)
        .filter(
          (code: CodeValue) =>
            code.isActive && code.tenantId === Number(tenantId)
        )
        .map((code: CodeValue) => ({
          value: code.id,
          label: code.codeValue,
        }));
    }
  }

  const { status: relationshipsStatus, data: relationships } = useGet<Code[]>(
    `${tenantId}/codes?filter={"where":{"name":"relationship"}}`,
    [`${tenantId}/codes?filter={"where":{"name":"relationship"}}`]
  );

  let relationshipsOptions: any = [];

  if (relationshipsStatus === "success") {
    if (relationships[0]?.codeValues) {
      relationshipsOptions = relationships[0]?.codeValues
        .sort((a: CodeValue, b: CodeValue) => a.orderPosition - b.orderPosition)
        .filter(
          (code: CodeValue) =>
            code.isActive && code.tenantId === Number(tenantId)
        )
        .map((code: CodeValue) => ({
          value: code.id,
          label: code.codeValue,
        }));
    }
  }

  return (
    <>
      <Button
        type="dashed"
        icon={<PlusOutlined />}
        size="middle"
        onClick={showModal}
        className="mb-5 col-span-6"
      >
        Create Family Member
      </Button>

      <Modal
        title="Create Family Member"
        centered
        width={720}
        open={open}
        footer={null}
        onCancel={handleCancel}
        destroyOnClose={true}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="grid grid-cols-2 gap-4"
        >
          <Form.Item
            name="firstName"
            label="First Name"
            rules={[
              {
                required: true,
                message: "Please input first name!",
              },
            ]}
          >
            <Input allowClear />
          </Form.Item>

          <Form.Item
            name="lastName"
            label="Last Name"
            rules={[
              {
                required: true,
                message: "Please input last name!",
              },
            ]}
          >
            <Input allowClear />
          </Form.Item>

          <Form.Item
            name="middleName"
            label="Middle Name"
            rules={[
              {
                required: false,
              },
            ]}
          >
            <Input allowClear />
          </Form.Item>

          <Form.Item
            name="professionId"
            label="Profession"
            rules={[
              {
                required: false,
              },
            ]}
          >
            <Select
              allowClear
              showSearch
              filterOption={filterOption}
              options={professionsOptions}
              notFoundContent={
                professionsStatus === "pending" ? "Loading..." : null
              }
            />
          </Form.Item>

          <Form.Item name="relationshipId" label="Relationship">
            <Select
              allowClear
              showSearch
              filterOption={filterOption}
              options={relationshipsOptions}
              notFoundContent={
                relationshipsStatus === "pending" ? "Loading..." : null
              }
            />
          </Form.Item>

          <Form.Item
            name="maritalStatusId"
            label="Marital Status"
            rules={[
              {
                required: false,
              },
            ]}
          >
            <Select
              allowClear
              showSearch
              filterOption={filterOption}
              options={maritalStatusesOptions}
              notFoundContent={
                maritalStatusesStatus === "pending" ? "Loading..." : null
              }
            />
          </Form.Item>

          <Form.Item
            className="col-span-1"
            name="qualification"
            label="Qualification"
          >
            <Input />
          </Form.Item>

          <Form.Item
            className="col-span-1"
            name="dateOfBirth"
            label="Date Of Birth"
          >
            <DatePicker
              className="w-full"
              maxDate={dayjs()}
              format={dateFormat}
            />
          </Form.Item>

          <Form.Item
            className="col-span-2 flex justify-start items-baseline"
            name="active"
            label={" "}
          >
            <Checkbox>Is Dependent?</Checkbox>
          </Form.Item>

          <div className="col-span-2">
            <FormSubmitButtons
              submitLoader={submitLoader}
              onReset={onReset}
              handleCancel={handleCancel}
            />
          </div>
        </Form>
      </Modal>
    </>
  );
}
