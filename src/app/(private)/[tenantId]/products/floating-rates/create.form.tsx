"use client";
import { useCreate, useGetById, usePatch } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { Checkbox, Form, Input } from "antd";
import { useEffect, useState } from "react";
import toast from "@/utils/toast";
import { ENDPOINT, PAGE_TITLE, QUERY_KEY } from "./constants";
import { FloatingRate, FloatingRatePeriod, SubmitType } from "@/types";
import CreateFloatingRatePeriodModal from "./create-floating-rate-period.modal";
import FloatingRatePeriodDataTable from "./floating-rate-period.data-table";
import { useParams } from "next/navigation";

export default function CreateForm(props: {
  submitType?: SubmitType;
  id?: number;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { tenantId } = useParams();
  const { submitType = "create", id, setIsModalOpen } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);

  const [floatingRatePeriodsData, setFloatingRatePeriodsData] = useState<
    FloatingRatePeriod[]
  >([]);

  const { mutate: insertFloatingRate } = useCreate(`${tenantId}/${ENDPOINT}`, [
    `${tenantId}/${QUERY_KEY}`,
  ]);
  const { mutate: updateFloatingRate } = usePatch(
    `${tenantId}/${ENDPOINT}`,
    id,
    [`${tenantId}/${QUERY_KEY}`]
  );

  const onReset = () => {
    form.resetFields();
  };

  const {
    status: floatingRateStatus,
    data: floatingRate,
    error: floatingRateError,
  } = useGetById<FloatingRate>(`${tenantId}/${ENDPOINT}`, id);

  useEffect(() => {
    if (
      submitType === "update" &&
      floatingRateStatus === "success" &&
      floatingRate
    ) {
      form.setFieldsValue({
        ...floatingRate,
      });
      setFloatingRatePeriodsData(floatingRate.floatingRatePeriods);
    }
  }, [submitType, floatingRateStatus, floatingRate, form]);

  function onFinish(values: any) {
    setSubmitLoader(true);

    let updatedValues = {
      floatingRate: values,
      floatingRatePeriods: floatingRatePeriodsData,
    };

    //delete ids if any as api will not accept it
    if (
      updatedValues.floatingRatePeriods !== undefined &&
      updatedValues.floatingRatePeriods.length > 0
    ) {
      updatedValues.floatingRatePeriods.map(
        (floatingRatePeriod: FloatingRatePeriod) => {
          delete floatingRatePeriod.id;
        }
      );
    }

    const submitTypeMessage = submitType === "create" ? "created" : "updated";

    if (submitType === "create") {
      insertFloatingRate(updatedValues, {
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
    } else {
      updateFloatingRate(updatedValues, {
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
      className="grid grid-cols-8 gap-2 justify-between"
    >
      <Form.Item
        className="col-span-4"
        name="name"
        label="Floating Rate"
        rules={[{ required: true, message: "Floating Rate is required!" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        className="col-span-2"
        name="isBaseLendingRate"
        label={" "}
        valuePropName="checked"
      >
        <Checkbox>Is Base Lending Rate</Checkbox>
      </Form.Item>

      <Form.Item
        className="col-span-2"
        name="isActive"
        label={" "}
        valuePropName="checked"
      >
        <Checkbox>Is Active</Checkbox>
      </Form.Item>

      <div className="col-span-8 flex justify-start gap-2">
        <label>
          <span style={{ fontSize: "1.2rem" }} className="text-red-300">
            *
          </span>{" "}
          Floating Rate Periods
        </label>

        <CreateFloatingRatePeriodModal
          submitType={submitType}
          floatingRatePeriodsData={floatingRatePeriodsData}
          setFloatingRatePeriodsData={setFloatingRatePeriodsData}
        />
      </div>

      <div className="col-span-8">
        <FloatingRatePeriodDataTable
          data={floatingRatePeriodsData}
          setFloatingRatePeriodsData={setFloatingRatePeriodsData}
        />
      </div>

      <div className="col-span-8 mt-5">
        <FormSubmitButtons submitLoader={submitLoader} onReset={onReset} />
      </div>
    </Form>
  );
}
