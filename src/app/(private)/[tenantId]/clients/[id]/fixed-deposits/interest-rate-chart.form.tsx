"use client";
import FormSubmitButtonsStep from "@/components/form-submit-buttons-step";
import {
  DepositAccount,
  InterestRateChart,
  InterestRateSlab,
  SavingsAccountInterestRateSlab,
  SubmitType,
} from "@/types";
import { dateFormat } from "@/utils/dates";
import { Button, Checkbox, DatePicker, Form, Modal } from "antd";
import dayjs from "dayjs";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import InterestRateSlabForm from "./interest-slab.form";
import InterestRateSlabDataTable from "./interest-rate-slab.data-table";

export default function InterestRateChartForm(props: {
  current: number;
  setCurrent: (value: React.SetStateAction<number>) => void;
  formValues: Partial<DepositAccount>;
  setFormValues: React.Dispatch<React.SetStateAction<Partial<any>>>;
  submitType?: SubmitType;
}) {
  const {
    current,
    submitType = "create",
    setCurrent,
    formValues,
    setFormValues,
  } = props;

  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);
  const [interestRateSlabData, setInterestRateSlabData] = useState<
    SavingsAccountInterestRateSlab[]
  >([]);
  const [selectedInterestRateSlabId, setSelectedInterestRateSlabId] =
    useState<number>(0);
  const [minFromPeriod, setMinFromPeriod] = useState<number>(1);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    // Initialize form values and interestRateSlabData
    const initialSlabs =
      formValues.savingsAccountInterestRateCharts?.[0]
        ?.savingsAccountInterestRateSlabs || [];
    setInterestRateSlabData(initialSlabs);

    form.setFieldsValue({
      ...formValues,
      fromDate: dayjs(
        formValues.savingsAccountInterestRateCharts?.[0]?.fromDate
      ),
      endDate:
        formValues.savingsAccountInterestRateCharts?.[0]?.endDate &&
        dayjs(formValues.savingsAccountInterestRateCharts?.[0]?.endDate),
      isPrimaryGroupingByAmount:
        formValues.savingsAccountInterestRateCharts?.[0]
          ?.isPrimaryGroupingByAmount,
    });

    // Set minFromPeriod based on the last slab
    if (initialSlabs.length > 0) {
      const lastSlab = initialSlabs[initialSlabs.length - 1];
      setMinFromPeriod((lastSlab.toPeriod ?? lastSlab.fromPeriod) + 1);
    }
  }, [form, formValues]);

  const onReset = () => {
    form.resetFields();
  };

  const onFinish = (values: any) => {
    setFormValues((prevFormValues) => {
      // Get existing charts or initialize an empty array
      const existingCharts =
        prevFormValues.savingsAccountInterestRateCharts || [];

      // Find the existing chart if it exists (assuming only one for now)
      const existingChart = existingCharts[0] || {};

      const updatedInterestRateChart: InterestRateChart = {
        ...existingChart, // Preserve other properties of the chart
        fromDate: values.fromDate.format(dateFormat),
        endDate: values.endDate ? values.endDate.format(dateFormat) : undefined,
        isPrimaryGroupingByAmount: values.isPrimaryGroupingByAmount,
        interestRateSlabs: [...interestRateSlabData], // Ensure slabs persist
      };

      return {
        ...prevFormValues,
        savingsAccountInterestRateCharts: [updatedInterestRateChart], // Merge instead of overwriting
      };
    });

    setSubmitLoader(true);
    setTimeout(() => {
      setSubmitLoader(false);
      setCurrent(current + 1);
    }, 500);
  };

  return (
    <Form
      layout="vertical"
      form={form}
      onValuesChange={(changedValues) => {
        if (changedValues.toPeriod !== undefined) {
          setMinFromPeriod(changedValues.toPeriod + 1);
        }
      }}
      name={"interestRateChartForm"}
      onFinish={onFinish}
      className="text-left grid grid-cols-6 gap-2"
    >
      <Form.Item
        name="fromDate"
        className="col-span-3"
        label="From Date"
        rules={[{ required: true, message: "From Date is required" }]}
      >
        <DatePicker className="w-full" maxDate={dayjs()} format={dateFormat} />
      </Form.Item>

      <Form.Item name="endDate" className="col-span-3" label="End Date">
        <DatePicker className="w-full" format={dateFormat} />
      </Form.Item>

      <Form.Item
        name="isPrimaryGroupingByAmount"
        className="col-span-3 flex justify-start items-center"
        valuePropName="checked"
        label={" "}
      >
        <Checkbox>Is primary grouping by Amount</Checkbox>
      </Form.Item>

      <div className="col-span-3 text-right flex justify-end items-center">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
        >
          Add Slab
        </Button>
      </div>

      <Modal
        title="Add Interest Rate Slab"
        open={isModalVisible}
        footer={false}
        onCancel={() => setIsModalVisible(false)}
      >
        <InterestRateSlabForm
          minFromPeriod={minFromPeriod}
          setMinFromPeriod={setMinFromPeriod}
          setSelectedInterestRateSlabId={setSelectedInterestRateSlabId}
          setInterestRateSlabData={
            setInterestRateSlabData as Dispatch<
              SetStateAction<InterestRateSlab[]>
            >
          }
          selectedInterestRateSlabId={selectedInterestRateSlabId}
          interestRateSlabData={interestRateSlabData}
          setIsModalVisible={setIsModalVisible}
          setFormValues={setFormValues}
        />
      </Modal>

      <div className="col-span-6">
        <InterestRateSlabDataTable
          data={interestRateSlabData}
          setInterestRateSlabData={setInterestRateSlabData}
          setFormValues={setFormValues}
        />
      </div>

      <div className="col-span-6">
        <FormSubmitButtonsStep
          submitText="Next"
          cancelText="Previous"
          submitLoader={submitLoader}
          onReset={onReset}
          handleCancel={() => setCurrent(current - 1)}
        />
      </div>
    </Form>
  );
}
