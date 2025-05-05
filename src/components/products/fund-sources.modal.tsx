"use client";
import { PlusOutlined } from "@ant-design/icons";
import { Button, Form, Modal, Select } from "antd";
import { useState } from "react";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { FundSource, GLAccount, PaymentType, SubmitType } from "@/types";
import { filterOption } from "@/utils/strings";
import { get, useGet } from "@/api";
import { useParams } from "next/navigation";

interface SelectOption {
  value: string;
  label: string;
}

interface FormValues {
  paymentTypeId: string;
  glAccountId: string;
}

interface NewFundSource {
  id: string;
  paymentType: {
    id: number;
    name: string;
  };
  glAccount: {
    id: number;
    name: string;
  };
}

export default function FundSourceModal(props: {
  submitType?: SubmitType;
  fundSourcesData: FundSource[];
  setFundSourcesData: (data: FundSource[]) => void;
}) {
  const { tenantId } = useParams();
  const { submitType = "create", fundSourcesData, setFundSourcesData } = props;
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

  const { status: paymentTypesStatus, data: paymentTypes } = useGet<
    PaymentType[]
  >(`${tenantId}/payment-types`, [`${tenantId}/payment-types`]);

  const paymentTypeOptions: SelectOption[] =
    paymentTypesStatus === "success"
      ? paymentTypes?.map((paymentType: PaymentType) => ({
          value: paymentType.id.toString(),
          label: paymentType.name,
        })) || []
      : [];

  const { status: glAccountsStatus, data: glAccounts } = useGet<GLAccount[]>(
    `${tenantId}/gl-accounts`,
    [`${tenantId}/gl-accounts`]
  );

  const glAccountsOptions: SelectOption[] =
    glAccountsStatus === "success"
      ? glAccounts?.map((account: GLAccount) => ({
          value: (account.id ?? "").toString(),
          label: account.name,
        })) || []
      : [];

  async function onFinish(values: FormValues) {
    setSubmitLoader(true);

    if (submitType === "create") {
      try {
        const paymentTypeResponse = await get(
          `${tenantId}/payment-types/${values.paymentTypeId}`
        );
        const glAccountResponse = await get(
          `${tenantId}/gl-accounts/${values.glAccountId}`
        );

        const paymentType: PaymentType = paymentTypeResponse.data;
        const glAccount: GLAccount = glAccountResponse.data;

        const newFundSource: NewFundSource = {
          id: `${paymentType.id}${glAccount.id}`, // Ensure id is a string
          paymentType: {
            id: paymentType.id,
            name: paymentType.name,
          },
          glAccount: {
            id: glAccount.id ?? 0, // Ensure id is defined
            name: glAccount.name,
          },
        };

        if (
          !fundSourcesData.some((fs) => fs.id?.toString() === newFundSource.id)
        ) {
          setFundSourcesData([
            ...fundSourcesData,
            newFundSource as unknown as FundSource,
          ]); // Type assertion to match FundSource
        }

        form.resetFields();
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setSubmitLoader(false);
      }
    }
  }

  return (
    <>
      <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
        <span className="capitalize">
          {submitType === "create" ? "Add" : "Edit"}
        </span>
      </Button>
      <Modal
        title={
          <h1 className="capitalize">
            Configure Fund Sources for Payment Channels
          </h1>
        }
        open={open}
        onCancel={handleCancel}
        footer={null}
        width={600}
      >
        <Form
          layout="vertical"
          form={form}
          name="Fund Source"
          onFinish={onFinish}
          className="grid grid-cols-2 gap-2"
        >
          <Form.Item
            className="col-span-2"
            name="paymentTypeId"
            label="Payment Type"
            rules={[{ required: true, message: "Payment Type is required!" }]}
          >
            <Select
              showSearch
              filterOption={filterOption}
              allowClear
              options={paymentTypeOptions}
            />
          </Form.Item>

          <Form.Item
            className="col-span-2"
            name="glAccountId"
            label="Fund Source"
            rules={[{ required: true, message: "Fund Source is required!" }]}
          >
            <Select
              showSearch
              filterOption={filterOption}
              allowClear
              options={glAccountsOptions}
            />
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
