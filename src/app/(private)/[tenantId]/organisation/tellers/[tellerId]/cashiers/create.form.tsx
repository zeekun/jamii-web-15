"use client";
import { useCreate, useGet, useGetById, usePatch } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import {
  Checkbox,
  CheckboxProps,
  DatePicker,
  Form,
  Input,
  Select,
  TimePicker,
} from "antd";
import { useEffect, useState } from "react";
import { PAGE_TITLE } from "./constants";
import { Cashier, Employee, SubmitType } from "@/types";
import { useParams, useRouter } from "next/navigation";
import toast from "@/utils/toast";
import { filterOption } from "@/utils/strings";
import { dateFormat } from "@/utils/dates";
import dayjs from "dayjs";

export default function CreateForm(props: {
  officeId: Number;
  submitType?: SubmitType;
  id?: number;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { tenantId, cashierId, tellerId } = useParams();
  const { submitType = "create", id, setIsModalOpen, officeId } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);
  const [showFullDayInputs, setShowFullDayInputs] = useState(false);
  const [fullDayChecked, setFullDayChecked] = useState(true);
  const router = useRouter();

  const { mutate: insertCashier } = useCreate(
    `${tenantId}/tellers/${tellerId}/cashiers`,
    [`${tenantId}/tellers/${tellerId}/cashiers`]
  );

  const { mutate: updateCashier } = usePatch(
    `${tenantId}/cashiers`,
    Number(cashierId)
  );

  const {
    status: cashierStatus,
    data: cashier,
    error: cashierError,
  } = useGetById<Cashier>(`${tenantId}/cashiers`, Number(cashierId));

  const {
    status: staffStatus,
    data: staff,
    error: staffError,
  } = useGet<Employee[]>(
    `${tenantId}/staff?filter={"where":{"officeId":${officeId},"isActive":true}}`,
    [
      `${tenantId}/staff?filter={"where":{"officeId":${officeId},"isActive":true}}`,
    ]
  );

  let staffOptions: any = [];

  if (staffStatus === "success") {
    staffOptions = staff.map((st: Employee) => {
      const c = `${st.firstName} ${st.middleName || ""} ${st.lastName}`;

      return {
        value: st.id,
        label: c,
      };
    });
  }

  useEffect(() => {
    if (submitType === "create") {
      setFullDayChecked(!fullDayChecked);
    }
    if (submitType === "update" && cashierStatus === "success" && cashier) {
      form.setFieldsValue({
        ...cashier,
        startDate: cashier.startDate ? dayjs(cashier.startDate) : null,
        endDate: cashier.endDate ? dayjs(cashier.endDate) : null,
        startTime: cashier.startDate
          ? dayjs(cashier.startTime)
          : dayjs("2025-01-08T22:00:00.000Z"),
        endTime: cashier.endDate
          ? dayjs(cashier.endTime)
          : dayjs("2025-01-08 23:03:00"),
      });

      if (cashier.fullDay === false) {
        setShowFullDayInputs(true);
      }
    }
  }, [submitType, cashierStatus, cashier, form]);

  const onReset = () => {
    form.resetFields();
  };

  function onFinish(values: any) {
    setSubmitLoader(true);
    const submitTypeMessage = submitType === "create" ? "created" : "updated";

    if (submitType === "create") {
      insertCashier(
        { ...values, tellerId: Number(tellerId) },
        {
          onSuccess: (response: any) => {
            setSubmitLoader(false);
            setIsModalOpen(false);

            console.log(response);

            const tellerIdFromRes = response?.tellerId;
            const cashierIdFromRes = response?.id;

            if (tenantId && tellerIdFromRes && cashierIdFromRes) {
              router.push(
                `/${tenantId}/organisation/tellers/${tellerIdFromRes}/cashiers/${cashierIdFromRes}`
              );
            } else {
              console.warn("Redirect failed: missing IDs or tenantId.");
            }

            toast({
              type: "success",
              response: `Cashier ${submitTypeMessage} successfully.`,
            });

            form.resetFields();
          },
          onError(error) {
            toast({ type: "error", response: error });
            setSubmitLoader(false);
          },
        }
      );
    } else {
      updateCashier(
        { id, ...values },
        {
          onSuccess: () => {
            setSubmitLoader(false);
            setIsModalOpen(false);
            toast({
              type: "success",
              response: `Cashier ${submitTypeMessage} successfully.`,
            });
          },
          onError(error) {
            toast({ type: "error", response: error });
            setSubmitLoader(false);
          },
        }
      );
    }
  }

  const onFullDayChange: CheckboxProps["onChange"] = (e) => {
    setShowFullDayInputs(!e.target.checked);
  };

  return (
    <Form
      layout="vertical"
      form={form}
      name={PAGE_TITLE}
      onFinish={onFinish}
      className="grid grid-cols-2 gap-2"
    >
      <Form.Item
        className="col-span-2"
        name="staffId"
        label="Cashier / Staff"
        rules={[{ required: true, message: "Cashier/Staff is required!" }]}
      >
        <Select
          disabled={submitType === "update" ? true : false}
          allowClear
          showSearch
          filterOption={filterOption}
          options={staffOptions}
        />
      </Form.Item>

      <Form.Item className="col-span-2" name="description" label="Description">
        <Input.TextArea rows={2} />
      </Form.Item>

      <Form.Item
        className="col-span-1"
        label="From"
        name="startDate"
        rules={[{ required: true, message: "Start Date is required!" }]}
      >
        <DatePicker className="w-full" format={dateFormat} />
      </Form.Item>

      <Form.Item
        className="col-span-1"
        label="To"
        name="endDate"
        dependencies={["startDate"]}
        rules={[
          { required: true, message: "End Date is required!" },
          ({ getFieldValue }) => ({
            validator(_, value) {
              const startDate = getFieldValue("startDate");
              if (
                !value ||
                !startDate ||
                dayjs(value).isAfter(dayjs(startDate).subtract(1, "day"))
              ) {
                return Promise.resolve();
              }
              return Promise.reject(
                new Error("End Date must be equal or after the Start Date!")
              );
            },
          }),
        ]}
      >
        <DatePicker className="w-full" format={dateFormat} />
      </Form.Item>

      <Form.Item
        className="col-span-2"
        name="fullDay"
        label={" "}
        valuePropName="checked"
      >
        <Checkbox defaultChecked={fullDayChecked} onChange={onFullDayChange}>
          Full Day{" "}
        </Checkbox>
      </Form.Item>

      {showFullDayInputs && (
        <>
          <Form.Item
            className="col-span-1"
            name="startTime"
            label="From (Time)"
            rules={[{ required: true, message: "Start Time is required!" }]}
          >
            <TimePicker format="h:mm A" showNow={false} className="w-full" />
          </Form.Item>

          <Form.Item
            className="col-span-1"
            name="endTime"
            label="Till (Time)"
            dependencies={["startTime"]}
            rules={[
              { required: true, message: "End Time is required!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const startTime = getFieldValue("startTime");
                  if (
                    !value ||
                    !startTime ||
                    dayjs(value, "h:mm A").isAfter(dayjs(startTime, "h:mm A"))
                  ) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("End Time must be after the Start Time!")
                  );
                },
              }),
            ]}
          >
            <TimePicker format="h:mm A" showNow={false} className="w-full" />
          </Form.Item>
        </>
      )}

      <div className="col-span-2">
        <FormSubmitButtons submitLoader={submitLoader} onReset={onReset} />
      </div>
    </Form>
  );
}
