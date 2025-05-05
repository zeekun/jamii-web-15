"use client";
import { useGet } from "@/api";
import FormSubmitButtonsStep from "@/components/form-submit-buttons-step";
import {
  InterestRateSlab,
  SavingsProduct,
  SubmitType,
  TaxGroup,
} from "@/types";
import { dateFormat } from "@/utils/dates";
import {
  Button,
  Checkbox,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Select,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import InterestRateSlabDataTable from "./interest-rate-slab.data-table";
import { PlusOutlined } from "@ant-design/icons";
import { useParams } from "next/navigation";

export default function InterestRateChartForm(props: {
  current: number;
  setCurrent: (value: React.SetStateAction<number>) => void;
  formValues: Partial<SavingsProduct>;
  setFormValues: React.Dispatch<React.SetStateAction<Partial<any>>>;
  submitType?: SubmitType;
}) {
  const { tenantId } = useParams();
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
    InterestRateSlab[]
  >([]);
  const [selectedInterestRateSlabId, setSelectedInterestRateSlabId] =
    useState<number>(0);

  useEffect(() => {
    const fromDate =
      formValues.interestRateCharts && formValues.interestRateCharts?.length > 0
        ? dayjs(formValues.interestRateCharts[0].fromDate)
        : "";
    const endDate =
      formValues.interestRateCharts &&
      formValues.interestRateCharts?.length > 0 &&
      formValues.interestRateCharts[0].endDate
        ? dayjs(formValues.interestRateCharts[0].endDate)
        : null;

    const isPrimaryGroupingByAmount =
      formValues.interestRateCharts &&
      formValues.interestRateCharts?.length > 0 &&
      formValues.interestRateCharts[0].isPrimaryGroupingByAmount
        ? formValues.interestRateCharts[0].isPrimaryGroupingByAmount
        : false;

    form.setFieldsValue({
      ...formValues,
      fromDate,
      endDate,
      isPrimaryGroupingByAmount,
    });

    //for update use cases

    if (submitType === "update") {
      if (
        formValues.interestRateCharts &&
        formValues.interestRateCharts.length > 0
      ) {
        const firstChart = formValues.interestRateCharts[0];
        if (
          firstChart.interestRateSlabs &&
          firstChart.interestRateSlabs.length > 0
        ) {
          setInterestRateSlabData(firstChart.interestRateSlabs);
        } else {
          // Handle empty interestRateSlabs array
          console.warn("interestRateSlabs array is empty.");
          // Or set a default value for interestRateSlabData
          setInterestRateSlabData([]);
        }
      } else {
        // Handle empty interestRateCharts array
        console.warn("interestRateCharts array is empty.");
        // Or set a default value for interestRateSlabData
        setInterestRateSlabData([]);
      }
    }

    if (
      formValues.interestRateChart?.interestRateSlabs &&
      formValues.interestRateChart?.interestRateSlabs.length > 0
    ) {
      setInterestRateSlabData(formValues.interestRateChart?.interestRateSlabs);
    }
  }, [form, formValues]);

  const onReset = () => {
    form.resetFields();
  };

  const {
    status: taxGroupsStatus,
    data: taxGroups,
    error: taxGroupsError,
  } = useGet<TaxGroup[]>(`${tenantId}/tax-groups`, [`${tenantId}/tax-groups`]);

  let taxGroupsOptions: any = [];

  if (taxGroupsStatus === "success") {
    taxGroupsOptions = taxGroups.map((taxGroup: TaxGroup) => {
      return { value: taxGroup.id, label: taxGroup.name };
    });
  }

  const onFinish = (values: any) => {
    setFormValues({
      ...formValues,
      ...values,
      interestRateChart: {
        fromDate: values.fromDate,
        endDate: values.endDate,
        isPrimaryGroupingByAmount: values.isPrimaryGroupingByAmount,
        interestRateSlabs: interestRateSlabData,
      },
    });
    setSubmitLoader(true);
    setTimeout(() => {
      setSubmitLoader(false);
      setCurrent(current + 1);
    }, 500);
  };

  const onClickInterestRateSlabAdd = () => {
    const periodTypeEnum = form.getFieldValue("periodTypeEnum");
    const description = form.getFieldValue("slabDescription");
    const fromPeriod = form.getFieldValue("fromPeriod");
    const toPeriod = form.getFieldValue("toPeriod");
    const amountRangeFrom = form.getFieldValue("amountRangeFrom");
    const amountRangeTo = form.getFieldValue("amountRangeTo");
    const annualInterestRate = form.getFieldValue("annualInterestRate");

    setSelectedInterestRateSlabId((prevData) => prevData + 1);
    // Append new slab to the existing data
    const newSlab: InterestRateSlab = {
      id: selectedInterestRateSlabId,
      fromPeriod,
      toPeriod,
      amountRangeFrom,
      amountRangeTo,
      annualInterestRate,
      description,
      periodTypeEnum,
    };

    setInterestRateSlabData((prevData) => [...prevData, newSlab]);

    // Reset fields related to slab input
    form.resetFields([
      "periodTypeEnum",
      "slabDescription",
      "fromPeriod",
      "toPeriod",
      "amountRangeFrom",
      "amountRangeTo",
      "annualInterestRate",
    ]);
  };

  return (
    <Form
      layout="vertical"
      form={form}
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
        className="col-span-6 flex justify-start items-center"
        valuePropName="checked"
        label={" "}
      >
        <Checkbox>Is primary grouping by Amount</Checkbox>
      </Form.Item>

      <Form.Item
        className="col-span-1 "
        name="periodTypeEnum"
        label="Period Type"
      >
        <Select>
          <option value={"DAYS"}>Days</option>
          <option value={"WEEKS"}>Weeks</option>
          <option value={"MONTHS"}>Months</option>
          <option value={"YEARS"}>Years</option>
        </Select>
      </Form.Item>

      <Form.Item name="fromPeriod" className="col-span-1" label="Period From">
        <InputNumber
          className="w-full"
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
        />
      </Form.Item>

      <Form.Item name="toPeriod" className="col-span-1" label="Period To">
        <InputNumber
          className="w-full"
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
        />
      </Form.Item>

      <Form.Item
        name="amountRangeFrom"
        className="col-span-1"
        label="Amount Range From"
      >
        <InputNumber
          className="w-full"
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
        />
      </Form.Item>

      <Form.Item
        name="amountRangeTo"
        className="col-span-1"
        label="Amount Range To"
      >
        <InputNumber
          className="w-full"
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
        />
      </Form.Item>

      <Form.Item
        name="annualInterestRate"
        className="col-span-1"
        label="Interest"
      >
        <InputNumber
          className="w-full"
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
        />
      </Form.Item>

      <Form.Item
        name="slabDescription"
        className="col-span-1"
        label="Description"
      >
        <Input />
      </Form.Item>

      <div className="cols-span-1  mt-[1.85rem]">
        <Button
          icon={<PlusOutlined />}
          onClick={onClickInterestRateSlabAdd}
          type="default"
          className="w-full"
        >
          Add
        </Button>
      </div>

      <div className="col-span-6">
        <InterestRateSlabDataTable
          data={interestRateSlabData}
          setInterestRateSlabData={setInterestRateSlabData}
        />
      </div>

      <div className="col-span-6">
        <FormSubmitButtonsStep
          submitText="Next"
          cancelText="Previous"
          submitLoader={submitLoader}
          onReset={onReset}
          handleCancel={() => {
            setCurrent(current - 1);
          }}
        />
      </div>
    </Form>
  );
}
