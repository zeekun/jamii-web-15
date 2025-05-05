"use client";
import { PlusOutlined } from "@ant-design/icons";
import { Button, Form, Modal, Select } from "antd";
import { SetStateAction, useState } from "react";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { Charge, GLAccount, PenaltyIncomeAccount, SubmitType } from "@/types";
import { filterOption } from "@/utils/strings";
import { get, useGet } from "@/api";
import { useParams } from "next/navigation";

export default function PenaltyIncomeAccountsModal(props: {
  submitType?: SubmitType;
  penaltyIncomeAccountsData: PenaltyIncomeAccount[];
  setPenaltyIncomeAccountsData: React.Dispatch<
    SetStateAction<PenaltyIncomeAccount[]>
  >;
}) {
  const { tenantId } = useParams();
  const {
    submitType = "create",
    penaltyIncomeAccountsData,
    setPenaltyIncomeAccountsData,
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
      `${tenantId}/charges?filter={"where":{"and":[{"chargeAppliesToEnum":"SAVINGS AND DEPOSITS"},{"isPenalty":true}]}}`,
    ],
    `?filter={"where":{"and":[{"chargeAppliesToEnum":"SAVINGS AND DEPOSITS"},{"isPenalty":true}]}}`
  );

  let chargesOptions: { value: string; label: string }[] = [];

  if (chargesStatus === "success") {
    chargesOptions = charges?.map((charge: Charge) => {
      return {
        value: charge.id.toString(),
        label: `${charge.name}`,
      };
    });
  }

  const { status: glIncomeAccountStatus, data: glIncomeAccounts } = useGet<
    GLAccount[]
  >(`${tenantId}/gl-accounts?types=INCOME`, [
    `${tenantId}/gl-accounts?types=INCOME`,
  ]);

  let glIncomeAccountsOptions: { value: string; label: string }[] = [];

  if (glIncomeAccountStatus === "success") {
    glIncomeAccountsOptions = glIncomeAccounts?.map((account: GLAccount) => {
      return {
        value: account.id.toString(),
        label: `${account.name}`,
      };
    });
  }

  async function onFinish(values: { chargeId: string; glAccountId: string }) {
    setSubmitLoader(true);

    if (submitType === "create") {
      const charge: Charge = (
        await get(`${tenantId}/charges/${values.chargeId}`)
      ).data;

      const glAccount: GLAccount = (
        await get(`${tenantId}/gl-accounts/${values.glAccountId}`)
      ).data;

      const newFeeIncomeAccount: PenaltyIncomeAccount = {
        id: parseInt(`${charge.name}${glAccount.name}`), // Ensure id is a number
        charge: charge, // Use the full Charge object
        glAccount: glAccount, // Use the full GLAccount object
      };

      //check if penaltyIncomeAccountsData already has an object with particular key, if not update the state
      if (
        !penaltyIncomeAccountsData.some(
          (fs) => fs.id?.toString() === newFeeIncomeAccount.id?.toString()
        )
      ) {
        setPenaltyIncomeAccountsData([
          ...penaltyIncomeAccountsData,
          newFeeIncomeAccount,
        ]);
      }

      form.resetFields();

      setSubmitLoader(false);
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
          name={"Penalties"}
          onFinish={onFinish}
          className="grid grid-cols-2 gap-2"
        >
          <Form.Item
            className="col-span-2"
            name="chargeId"
            label="Penalty"
            rules={[{ required: true, message: "Penalty is required!" }]}
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
