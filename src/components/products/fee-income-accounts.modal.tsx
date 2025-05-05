"use client";
import { PlusOutlined } from "@ant-design/icons";
import { Button, Form, Modal, Select } from "antd";
import { useState } from "react";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { Charge, FeeIncomeAccount, GLAccount, SubmitType } from "@/types";
import { filterOption } from "@/utils/strings";
import { get, useGet } from "@/api";
import { useParams } from "next/navigation";

interface SelectOption {
  value: string;
  label: string;
}

interface FormValues {
  chargeId: string;
  glAccountId: string;
}

export default function FeeIncomeAccountsModal(props: {
  submitType?: SubmitType;
  feeIncomeAccountsData: FeeIncomeAccount[];
  setFeeIncomeAccountsData: React.Dispatch<
    React.SetStateAction<FeeIncomeAccount[]>
  >;
}) {
  const { tenantId } = useParams();
  const {
    submitType = "create",
    feeIncomeAccountsData,
    setFeeIncomeAccountsData,
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

  const { status: chargesStatus, data: charges } = useGet<Charge[]>(
    `${tenantId}/charges`,
    [
      `${tenantId}/charges?filter={"where":{"and":[{"chargeAppliesToEnum":"SAVINGS AND DEPOSITS"},{"isPenalty":false}]}}`,
    ],
    `?filter={"where":{"and":[{"chargeAppliesToEnum":"SAVINGS AND DEPOSITS"},{"isPenalty":false}]}}`
  );

  const chargesOptions: SelectOption[] =
    chargesStatus === "success"
      ? charges?.map((charge: Charge) => ({
          value: charge.id.toString(),
          label: charge.name,
        })) || []
      : [];

  const { status: glIncomeAccountStatus, data: glIncomeAccounts } = useGet<
    GLAccount[]
  >(`${tenantId}/gl-accounts?types=INCOME`, [
    `${tenantId}/gl-accounts?types=INCOME`,
  ]);

  const glIncomeAccountsOptions: SelectOption[] =
    glIncomeAccountStatus === "success"
      ? glIncomeAccounts?.map((account: GLAccount) => ({
          value: (account.id ?? "").toString(),
          label: account.name,
        })) || []
      : [];

  async function onFinish(values: FormValues) {
    setSubmitLoader(true);

    if (submitType === "create") {
      try {
        const chargeResponse = await get(
          `${tenantId}/charges/${values.chargeId}`
        );
        const glAccountResponse = await get(
          `${tenantId}/gl-accounts/${values.glAccountId}`
        );

        const charge: Charge = chargeResponse.data;
        const glAccount: GLAccount = glAccountResponse.data;

        const newFeeIncomeAccount: FeeIncomeAccount = {
          id: charge.id, // Ensure id is a number as expected by FeeIncomeAccount
          charge: {
            ...charge,
          },
          glAccount: {
            ...glAccount,
          },
        };

        if (
          !feeIncomeAccountsData.some(
            (fs) => fs.id?.toString() === newFeeIncomeAccount.id
          )
        ) {
          setFeeIncomeAccountsData([
            ...feeIncomeAccountsData,
            newFeeIncomeAccount,
          ]);
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
          <h1 className="capitalize">Map Fees to specific Income Accounts</h1>
        }
        open={open}
        onCancel={handleCancel}
        footer={null}
        width={600}
      >
        <Form
          layout="vertical"
          form={form}
          name="Fees"
          onFinish={onFinish}
          className="grid grid-cols-2 gap-2"
        >
          <Form.Item
            className="col-span-2"
            name="chargeId"
            label="Fees"
            rules={[{ required: true, message: "Fees is required!" }]}
          >
            <Select
              showSearch
              filterOption={filterOption}
              allowClear
              options={chargesOptions}
            />
          </Form.Item>

          <Form.Item
            className="col-span-2"
            name="glAccountId"
            label="Income Account"
            rules={[{ required: true, message: "Income Account is required!" }]}
          >
            <Select
              showSearch
              filterOption={filterOption}
              allowClear
              options={glIncomeAccountsOptions}
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
