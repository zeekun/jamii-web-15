"use client";
import { useCreate, useGet, useGetById, usePatch } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { Holiday, RepaymentScheduleType, SubmitType } from "@/types";
import { dateFormat } from "@/utils/dates";
import { DatePicker, Form, Input, Select } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { ENDPOINT, PAGE_TITLE, QUERY_KEY } from "./constants";
import { useParams } from "next/navigation";
import toast from "@/utils/toast";

const today = dayjs(new Date()).format(dateFormat);

export default function CreateForm(props: {
  submitType?: SubmitType;
  id?: number;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleCancel?: () => void;
}) {
  const { tenantId } = useParams();
  const { submitType = "create", id, handleCancel, setIsModalOpen } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);
  const [showScheduleDate, setShowScheduleDate] = useState(false);
  const [maxToDate, setMaxToDate] = useState<any>();

  const {
    status: repaymentScheduleTypesStatus,
    data: repaymentScheduleTypes,
    error: repaymentScheduleTypesError,
  } = useGet<RepaymentScheduleType[]>(`1/repayment-reschedule-types`, [
    `1/repayment-reschedule-types`,
  ]);

  const { mutate: insertHoliday } = useCreate(`${tenantId}/${ENDPOINT}`, [
    `${tenantId}/${QUERY_KEY}`,
  ]);
  const { mutate: updateHoliday } = usePatch(`${tenantId}/${ENDPOINT}`, id, [
    `${tenantId}/${QUERY_KEY}`,
  ]);

  const {
    status: holidayStatus,
    data: holiday,
    error: holidayError,
  } = useGetById<Holiday>(`${tenantId}/${ENDPOINT}`, id);

  let repaymentScheduleTypesOptions: any = [];
  let recurrenceTypeOptions = [
    { value: "ANNUAL", label: "Annual" },
    { value: "ONE-TIME", label: "One-Time" },
  ];

  if (repaymentScheduleTypesStatus === "success") {
    repaymentScheduleTypesOptions = repaymentScheduleTypes.map(
      (type: { id: number; name: string }) => {
        return { value: type.id, label: type.name };
      }
    );
  }

  const onReset = () => {
    form.resetFields();
  };

  useEffect(() => {
    if (submitType === "update" && holidayStatus === "success" && holiday) {
      form.setFieldsValue({
        name: holiday.name,
        fromDate: holiday.fromDate ? dayjs(holiday.fromDate) : null,
        toDate: holiday.toDate ? dayjs(holiday.toDate) : null,
        repaymentScheduleTypeId: holiday.repaymentScheduleTypeId,
        repaymentScheduledTo: holiday.repaymentScheduledTo
          ? dayjs(holiday.repaymentScheduledTo)
          : null,
        recurrenceType: holiday.recurrenceType,
      });
    }
  }, [submitType, holidayStatus, holiday, form]);

  function onFinish(values: any) {
    setSubmitLoader(true);

    const submitTypeMessage = submitType === "create" ? "created" : "updated";

    if (submitType === "create") {
      insertHoliday(values, {
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
      updateHoliday(
        { id, ...values },
        {
          onSuccess: () => {
            setSubmitLoader(false);
            setIsModalOpen(false);

            toast({
              type: "success",
              response: `${PAGE_TITLE} ${submitTypeMessage} successfully.`,
            });
          },
          onError(error, variables, context) {
            toast({ type: "error", response: error });

            setSubmitLoader(false);
          },
        }
      );
    }
  }

  function onRepaymentSchedulingTypeChange(value: number) {
    if (value === 1) {
      setShowScheduleDate(true);
    } else if (value === 2) {
      setShowScheduleDate(false);
    }
  }

  return (
    <Form
      layout="vertical"
      form={form}
      name={`${PAGE_TITLE}${id}`}
      onFinish={onFinish}
      className="grid grid-cols-2 gap-2"
    >
      <Form.Item
        className="col-span-2"
        name="name"
        label="Holiday"
        rules={[{ required: true, message: "Holiday is required!" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="From Date"
        name="fromDate"
        rules={[{ required: true, message: "From Date is required!" }]}
      >
        <DatePicker
          onChange={(date, dateString) => {
            setMaxToDate(dateString);
          }}
          className="w-full"
          format={dateFormat}
        />
      </Form.Item>

      <Form.Item
        label="To Date"
        name="toDate"
        rules={[{ required: true, message: "To Date is required!" }]}
      >
        <DatePicker
          className="w-full"
          minDate={dayjs(maxToDate, dateFormat)}
          format={dateFormat}
        />
      </Form.Item>

      <Form.Item
        name="repaymentScheduleTypeId"
        label="Repayment Reschedule Type"
        rules={[
          {
            required: true,
            message: "Repayment Reschedule Type is required!",
          },
        ]}
      >
        <Select
          allowClear
          onChange={onRepaymentSchedulingTypeChange}
          options={repaymentScheduleTypesOptions}
        />
      </Form.Item>

      <Form.Item
        name="recurrenceType"
        label="Recurrence Type"
        rules={[
          {
            required: true,
            message: "Recurrence Type is required!",
          },
        ]}
      >
        <Select allowClear options={recurrenceTypeOptions} />
      </Form.Item>

      {showScheduleDate ? (
        <Form.Item
          label="Repayment Scheduled To"
          name={"repaymentScheduledTo"}
          rules={[
            {
              required: showScheduleDate,
              message: "Repayment Scheduled To is required!",
            },
          ]}
        >
          <DatePicker className="w-full" format={dateFormat} />
        </Form.Item>
      ) : null}

      <div className="col-span-2 ">
        <FormSubmitButtons
          submitLoader={submitLoader}
          onReset={onReset}
          handleCancel={handleCancel}
        />
      </div>
    </Form>
  );
}
