"use client";
import { InterestRateSlab } from "@/types"; // Ensure this type is imported
import toast from "@/utils/toast";
import { Button, Form, Input, InputNumber, Select } from "antd";
import { useEffect } from "react";

interface InterestRateSlabFormProps {
  minFromPeriod: number;
  setMinFromPeriod: (value: number) => void;
  setSelectedInterestRateSlabId: (value: React.SetStateAction<number>) => void;
  selectedInterestRateSlabId: number;
  setInterestRateSlabData: React.Dispatch<
    React.SetStateAction<InterestRateSlab[]>
  >;
  interestRateSlabData: InterestRateSlab[];
  setIsModalVisible: (value: boolean) => void;
  setFormValues: React.Dispatch<React.SetStateAction<Partial<any>>>; // Add this prop
}

export default function InterestRateSlabForm({
  minFromPeriod,
  setMinFromPeriod,
  setSelectedInterestRateSlabId,
  selectedInterestRateSlabId,
  setInterestRateSlabData,
  interestRateSlabData,
  setIsModalVisible,
  setFormValues, // Add this prop
}: InterestRateSlabFormProps) {
  const [form] = Form.useForm();

  // Reset form fields when the modal is opened
  useEffect(() => {
    form.resetFields();
  }, [form]);

  const onClickInterestRateSlabAdd = (values: any) => {
    const {
      periodTypeEnum,
      slabDescription: description,
      fromPeriod,
      toPeriod,
      amountRangeFrom,
      amountRangeTo,
      annualInterestRate,
    } = values;

    // Validate periods
    if (toPeriod && fromPeriod >= toPeriod) {
      toast({
        type: "error",
        response: "The 'From Period' must be less than the 'To Period'.",
      });
      return;
    }

    // Check for overlap with existing slabs
    const lastSlab = interestRateSlabData[interestRateSlabData.length - 1];

    if (lastSlab) {
      if (toPeriod === undefined && fromPeriod <= lastSlab.fromPeriod) {
        toast({
          type: "error",
          response:
            "The 'From Period' must be greater than the previous 'From Period'.",
        });
        return;
      }

      if (lastSlab.toPeriod && fromPeriod <= lastSlab.toPeriod) {
        toast({
          type: "error",
          response:
            "The 'From Period' must be greater than the last slab's 'To Period'.",
        });
        return;
      }
    }

    // Generate a new slab ID
    const newSlabId = selectedInterestRateSlabId + 1;
    setSelectedInterestRateSlabId(newSlabId);

    // Create the new slab
    const newSlab: InterestRateSlab = {
      id: newSlabId,
      fromPeriod,
      toPeriod,
      amountRangeFrom,
      amountRangeTo,
      annualInterestRate,
      description,
      periodTypeEnum,
    };

    // Update interestRateSlabData
    const updatedSlabs = [...interestRateSlabData, newSlab];
    setInterestRateSlabData(updatedSlabs);

    // Update formValues in the parent component
    setFormValues((prevFormValues) => ({
      ...prevFormValues,
      savingsAccountInterestRateCharts: [
        {
          ...prevFormValues.savingsAccountInterestRateCharts?.[0],
          savingsAccountInterestRateSlabs: updatedSlabs,
        },
      ],
    }));

    // Update minFromPeriod for the next slab
    if (toPeriod) {
      setMinFromPeriod(toPeriod + 1);
    } else {
      setMinFromPeriod(fromPeriod + 1);
    }

    // Reset form fields and close the modal
    form.resetFields();
    setIsModalVisible(false);
  };

  return (
    <Form
      layout="vertical"
      form={form}
      onValuesChange={(changedValues) => {
        if (changedValues.toPeriod !== undefined) {
          setMinFromPeriod(changedValues.toPeriod + 1);
        } else if (changedValues.fromPeriod !== undefined) {
          setMinFromPeriod(changedValues.fromPeriod + 1);
        }
      }}
      name={"interestRateSlabForm"}
      onFinish={onClickInterestRateSlabAdd}
      className="text-left grid grid-cols-6 gap-2"
    >
      <Form.Item
        className="col-span-2"
        name="periodTypeEnum"
        label="Period Type"
        rules={[{ required: true, message: "Period Type is required" }]}
      >
        <Select>
          <option value={"DAYS"}>Days</option>
          <option value={"WEEKS"}>Weeks</option>
          <option value={"MONTHS"}>Months</option>
          <option value={"YEARS"}>Years</option>
        </Select>
      </Form.Item>

      <Form.Item
        name="fromPeriod"
        className="col-span-2"
        label="Period From"
        rules={[{ required: true, message: "Period From is required" }]}
      >
        <InputNumber
          className="w-full"
          min={minFromPeriod}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
        />
      </Form.Item>

      <Form.Item
        name="toPeriod"
        className="col-span-2"
        label="Period To"
        rules={[
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("fromPeriod") < value) {
                return Promise.resolve();
              }
              return Promise.reject(
                new Error("To Period must be greater than From Period")
              );
            },
          }),
        ]}
      >
        <InputNumber
          className="w-full"
          min={minFromPeriod}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
        />
      </Form.Item>

      <Form.Item
        name="amountRangeFrom"
        className="col-span-3"
        label="Amount Range From"
        rules={[{ required: true, message: "Amount Range From is required" }]}
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
        className="col-span-3"
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
        className="col-span-3"
        label="Interest"
        rules={[{ required: true, message: "Interest is required" }]}
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
        className="col-span-3"
        label="Description"
      >
        <Input />
      </Form.Item>

      <Form.Item className="col-span-6">
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
}
