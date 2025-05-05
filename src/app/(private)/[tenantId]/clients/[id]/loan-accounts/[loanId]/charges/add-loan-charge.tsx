"use client";
import { get, useCreate, useGet, usePatch } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { Form, Input, InputNumber, Select } from "antd";
import { SetStateAction, useEffect, useState } from "react";
import { Charge, Loan, SubmitType } from "@/types";
import { filterOption } from "@/utils/strings";
import { useParams } from "next/navigation";
import toast from "@/utils/toast";

export default function AddLoanChargesForm(props: {
  loan?: Loan;
  submitType: SubmitType;
  id?: number;
  setIsModalOpen: React.Dispatch<SetStateAction<boolean>>;
}) {
  const { loan, submitType, id, setIsModalOpen } = props;
  const { tenantId, loanId } = useParams();
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);
  const [selectedCharge, setSelectedCharge] = useState<Charge>();

  const [showChargeInputs, setShowChargeInputs] = useState(false);
  const [selectedChargeId, setSelectedChargeId] = useState<
    number | undefined
  >();
  const [showSavingsProductLoading, setShowSavingsProductLoading] =
    useState(false);

  // this does not seem right but it is working
  const loanProductId = loan?.loanProductId
    ? loan?.loanProductId
    : loan?.loanProduct.id;

  let {
    status: chargesStatus,
    data: charges,
    error,
  } = useGet<Charge[]>(
    `${tenantId}/charges?filter={"where":{"and":[{"chargeAppliesToEnum":"LOANS"},{"isActive":true}]}}`,
    [
      `${tenantId}/charges?filter={"where":{"and":[{"chargeAppliesToEnum":"LOANS"},{"isActive":true}]}}`,
    ]
  );

  let chargesOptions: any = [];

  if (chargesStatus === "success") {
    chargesOptions = charges?.map((charge: Charge) => {
      return {
        value: charge.id,
        label: charge.name,
      };
    });
  }

  const { mutate: saveCharge } = useCreate(
    `${tenantId}/loans/${loanId}/loan-charges`
  );

  const { mutate: updateCharge } = usePatch(`${tenantId}/loan-charges`, id!, [
    `${tenantId}/loans/${loanId}/loan-charges`,
  ]);

  const onFinish = (values: any) => {
    setSubmitLoader(true);
    const payload = {
      chargeTimeEnum: values.chargeTimeTypeEnum,
      chargeCalculationEnum: values.chargeCalculationTypeEnum,
      loanId: Number(loanId),
      chargeId: selectedCharge?.id,
      amount: values.amount,
      isPenalty: selectedCharge?.isPenalty,
      chargePaymentModeEnum: selectedCharge?.chargePaymentModeEnum,
      amountOutstandingDerived: selectedCharge?.amount,
      chargeAmountOrPercentage: values.amount,
      calculationPercentage:
        selectedCharge?.chargeCalculationTypeEnum !== "FLAT"
          ? values.amount
          : 0,
    };

    if (submitType === "create") {
      saveCharge(payload, {
        onSuccess: () => {
          setSubmitLoader(false);
          toast({
            type: "success",
            response: `Charge added successfully.`,
          });
          setIsModalOpen(false);
        },
        onError: (error) => {
          setSubmitLoader(false);
          toast({ type: "error", response: error });
        },
      });
    } else {
      updateCharge(payload, {
        onSuccess: () => {
          setSubmitLoader(false);
          toast({
            type: "success",
            response: `Charge updated successfully.`,
          });
          setIsModalOpen(false);
        },
        onError: (error) => {
          setSubmitLoader(false);
          toast({ type: "error", response: error });
        },
      });
    }
  };

  useEffect(() => {
    if (submitType === "update" && id) {
      setShowSavingsProductLoading(true);
      get(`${tenantId}/loan-charges/${id}`).then((res) => {
        form.setFieldsValue({
          ...res.data,
          chargeCalculationTypeEnum: res.data.chargeCalculationEnum,
          chargeTimeTypeEnum: res.data.chargeTimeEnum,
        });
        setShowSavingsProductLoading(false);
        setSelectedCharge(res.data.charge);
        setShowChargeInputs(true);
      });
    }
  }, [id, submitType]);

  const onChangeCharge = (id: number) => {
    setShowChargeInputs(true);
    setShowSavingsProductLoading(true);
    setSelectedChargeId(id);
  };

  useEffect(() => {
    if (selectedChargeId) {
      get(`${tenantId}/charges/${selectedChargeId}`).then((res) => {
        setShowChargeInputs(true);
        setSelectedCharge(res.data);
        setShowSavingsProductLoading(false);
        form.setFieldsValue(res.data);
      });
    }
  }, [selectedChargeId]);

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Form.Item
        className="col-span-2"
        name="chargeId"
        label="Charge"
        rules={[{ required: true, message: "Charge is required!" }]}
      >
        <Select
          onChange={onChangeCharge}
          showSearch
          allowClear
          filterOption={filterOption}
          options={chargesOptions}
          loading={chargesStatus === "pending" ? true : false}
        />
      </Form.Item>
      {showSavingsProductLoading && (
        <div className="col-span-4">Loading...</div>
      )}
      {showChargeInputs && (
        <>
          <Form.Item
            className="col-span-2"
            name="amount"
            label={`Amount (${
              selectedCharge?.chargeCalculationTypeEnum === "FLAT"
                ? selectedCharge.currencyId
                : "%"
            }) `}
            rules={[{ required: true, message: "Amount is required!" }]}
          >
            <InputNumber
              className="w-full"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
            />
          </Form.Item>

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
        </>
      )}
      <FormSubmitButtons submitLoader={submitLoader} />
    </Form>
  );
}
