"use client";
import { useCreateV2, useGet, useGetById } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { Charge, SubmitType, Tenant } from "@/types";
import { DatePicker, Form, Input, InputNumber, Select } from "antd";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import toast from "@/utils/toast";
import { filterOption } from "@/utils/strings";
import { dateFormat } from "@/utils/dates";

export default function CreateForm(props: {
  submitType?: SubmitType;
  id?: number;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { tenantId, savingId } = useParams();
  const { submitType = "create", id, setIsModalOpen } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);
  const [showChargeInputs, setShowChargeInputs] = useState(false);
  const [showChargeDueDateInput, setShowChargeDueDateInput] = useState(false);
  const [selectedChargeId, setSelectedChargeId] = useState<number>();
  const [shouldFetch, setShouldFetch] = useState(false);

  const { mutate: insertSavingAccountCharge } = useCreateV2(
    `${tenantId}/savings-account-charges`,
    [
      `${tenantId}/savings-account-charges?filter={"where":{"savingsAccountId":${savingId}},"order":["id DESC"]}`,
      `${tenantId}/savings-accounts`,
      `${savingId}`,
    ]
  );

  const {
    status: chargesStatus,
    data: charges,
    error: chargesError,
  } = useGet<Charge[]>(
    `${tenantId}/charges?filter={"where":{"chargeAppliesToEnum":"SAVINGS AND DEPOSITS","isActive":true}}`,
    [
      `${tenantId}/charges?filter={"where":{"chargeAppliesToEnum":"SAVINGS AND DEPOSITS","isActive":true}}`,
    ]
  );

  let chargesOptions: any = [];

  if (chargesStatus === "success") {
    chargesOptions = charges?.map((charge: Charge) => {
      return {
        value: charge.id,
        label: `${charge.name}`,
      };
    });
  }

  const {
    status: selectedChargeDataStatus,
    data: selectedChargeData,
    error: selectedChargeDataError,
  } = useGetById<Charge>(
    `${tenantId}/charges`,
    shouldFetch ? selectedChargeId : undefined
  );

  useEffect(() => {
    if (selectedChargeDataStatus === "success" && selectedChargeData) {
      form.setFieldsValue({
        amount: selectedChargeData.amount,
        chargeCalculationTypeEnum: selectedChargeData.chargeCalculationTypeEnum,
        chargeTimeTypeEnum: selectedChargeData.chargeTimeTypeEnum,
      });
      setShowChargeInputs(true);

      if (
        selectedChargeData.chargeTimeTypeEnum === "ANNUAL FEE" ||
        selectedChargeData.chargeTimeTypeEnum === "MONTHLY FEE" ||
        selectedChargeData.chargeTimeTypeEnum === "WEEKLY FEE" ||
        selectedChargeData.chargeTimeTypeEnum === "SPECIFIED DUE DATE"
      ) {
        setShowChargeDueDateInput(true);
      }
    }
  }, [selectedChargeDataStatus, selectedChargeData, form]);

  const onReset = () => {
    form.resetFields();
  };

  function onFinish(values: any) {
    setSubmitLoader(true);

    const amountPaidDerived =
      values.chargeTimeTypeEnum === "WITHDRAWAL FEE" ? values.amount : 0;
    const amountOutstandingDerived =
      values.chargeTimeTypeEnum === "WITHDRAWAL FEE" ? 0 : values.amount;

    const updatedValues = {
      chargeCalculationEnum: values.chargeCalculationTypeEnum,
      chargeTimeEnum: values.chargeTimeTypeEnum,
      savingsAccountId: Number(savingId),
      chargeId: selectedChargeId,
      amount: values.amount,
      chargeDueDate: values.chargeDueDate,
      amountPaidDerived,
      amountOutstandingDerived,
    };
    if (submitType === "create") {
      insertSavingAccountCharge(updatedValues, {
        onSuccess: () => {
          setSubmitLoader(false);
          toast({
            type: "success",
            response: `Charge added successfully.`,
          });
          form.resetFields();
          setIsModalOpen(false);
          setShowChargeInputs(false);
        },
        onError(error, variables, context) {
          toast({ type: "error", response: error });
          setSubmitLoader(false);
        },
      });
    } else {
      //   updateUser(
      //     { id, ...tenant },
      //     {
      //       onSuccess: () => {
      //         setSubmitLoader(false);
      //         setIsModalOpen(false);
      //         toast({
      //           type: "success",
      //           response: `${PAGE_TITLE} ${submitTypeMessage} successfully.`,
      //         });
      //       },
      //       onError(error, variables, context) {
      //         toast({ type: "error", response: error });
      //         setSubmitLoader(false);
      //       },
      //     }
      //   );
    }
  }

  const onChangeCharge = (id: number) => {
    setShowChargeDueDateInput(false);
    setShowChargeInputs(true);
    setSelectedChargeId(id);
    setShouldFetch(true); // Trigger the fetch of selected charge data
  };

  return (
    <Form
      layout="vertical"
      form={form}
      name={submitType === "create" ? submitType : `${submitType}${id}`}
      onFinish={onFinish}
      className="grid grid-cols-2 gap-2"
    >
      <Form.Item
        className="col-span-2"
        name="chargeId"
        label="Charges"
        rules={[{ required: true, message: "Charge is required!" }]}
      >
        <Select
          showSearch
          allowClear
          filterOption={filterOption}
          onChange={onChangeCharge}
          options={chargesOptions}
        />
      </Form.Item>

      <Form.Item
        className="col-span-2"
        name="amount"
        label="Amount"
        rules={[{ required: true, message: "Amount is required!" }]}
      >
        <InputNumber
          style={{ width: "100%" }}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
        />
      </Form.Item>

      {showChargeInputs && (
        <>
          <Form.Item
            className="col-span-2"
            name="chargeCalculationTypeEnum"
            label="Charge Calculation"
            rules={[
              { required: true, message: "Charge Calculation is required!" },
            ]}
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            className="col-span-2"
            name="chargeTimeTypeEnum"
            label="Charge Time"
            rules={[{ required: true, message: "Charge Time is required!" }]}
          >
            <Input disabled />
          </Form.Item>

          {showChargeDueDateInput && (
            <Form.Item
              className="col-span-2"
              name="chargeDueDate"
              label="Due For Collection On"
              rules={[
                {
                  required: true,
                  message: "Due For Collection On is required!",
                },
              ]}
            >
              <DatePicker className="w-full" format={dateFormat} />
            </Form.Item>
          )}
        </>
      )}

      <div className="col-span-2 ">
        <FormSubmitButtons submitLoader={submitLoader} onReset={onReset} />
      </div>
    </Form>
  );
}
