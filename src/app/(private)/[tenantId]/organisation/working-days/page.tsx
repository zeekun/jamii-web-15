"use client";
import { useGet, usePatch } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { Checkbox, Form, Select, Tag, List, Skeleton } from "antd";
import { useState, useEffect } from "react";
import {
  ENDPOINT,
  PAGE_TITLE,
  QUERY_KEY,
  readPermissions,
  updatePermissions,
} from "./constants";
import PageHeader from "@/components/page-header";
import { useParams } from "next/navigation";
import { WorkingDay } from "@/types";
import toast from "@/utils/toast";
import { useRoles } from "@/providers/RolesProvider";
import { hasPermission } from "@/utils/permissions";
import AccessDenied from "@/components/access-denied";
import Alert_ from "@/components/alert";

export default function Page() {
  const { tenantId } = useParams();
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);

  const {
    permissions,
    error: permissionsError,
    isPermissionsLoading,
  } = useRoles();

  const canRead = hasPermission(permissions, readPermissions);
  const canUpdate = hasPermission(permissions, updatePermissions);

  const {
    status,
    data: workingDay,
    error,
  } = useGet<WorkingDay[]>(
    `${tenantId}/${ENDPOINT}?filter={"where":{"tenantId":${tenantId}}}`,
    [`${tenantId}/${QUERY_KEY}?filter={"where":{"tenantId":${tenantId}}}`]
  );

  const workingDayId =
    status === "success" && workingDay.length > 0
      ? workingDay[0].id
      : undefined;

  const { mutate: updateWorkingDays } = usePatch(
    `${tenantId}/${ENDPOINT}`,
    workingDayId,
    [`${tenantId}/${QUERY_KEY}?filter={"where":{"tenantId":${tenantId}}}`]
  );

  const onReset = () => {
    form.resetFields();
  };

  useEffect(() => {
    if (status === "success" && workingDay?.length > 0) {
      const recurrence = workingDay[0].recurrence;
      const days =
        recurrence
          .split(";")
          .find((item) => item.startsWith("BYDAY="))
          ?.replace("BYDAY=", "")
          .split(",") || [];

      const initialValues: Record<string, boolean> = {
        monday: days.includes("MO"),
        tuesday: days.includes("TU"),
        wednesday: days.includes("WE"),
        thursday: days.includes("TH"),
        friday: days.includes("FR"),
        saturday: days.includes("SA"),
        sunday: days.includes("SU"),
      };

      form.setFieldsValue({
        ...initialValues,
        repaymentReschedulingEnum: workingDay[0].repaymentReschedulingEnum,
        extendTermDailyRepayments: workingDay[0].extendTermDailyRepayments,
      });
    }
  }, [status, workingDay, form]);

  if (isPermissionsLoading) {
    return <Skeleton />;
  }

  if (permissionsError)
    return (
      <Alert_ message="Error" description={permissionsError} type="error" />
    );

  const renderDayList = (daysActive: string[]) => {
    const days = [
      { name: "Monday", key: "MO" },
      { name: "Tuesday", key: "TU" },
      { name: "Wednesday", key: "WE" },
      { name: "Thursday", key: "TH" },
      { name: "Friday", key: "FR" },
      { name: "Saturday", key: "SA" },
      { name: "Sunday", key: "SU" },
    ];

    return (
      <List
        dataSource={days}
        renderItem={(day) => (
          <List.Item>
            <Tag color={daysActive.includes(day.key) ? "green" : "red"}>
              {day.name} {daysActive.includes(day.key) ? "✓" : "✗"}
            </Tag>
          </List.Item>
        )}
      />
    );
  };

  function onFinish(values: any) {
    setSubmitLoader(true);

    const recurrence = `FREQ=WEEKLY;INTERVAL=1;BYDAY=${[
      values.monday ? "MO" : "",
      values.tuesday ? "TU" : "",
      values.wednesday ? "WE" : "",
      values.thursday ? "TH" : "",
      values.friday ? "FR" : "",
      values.saturday ? "SA" : "",
      values.sunday ? "SU" : "",
    ]
      .filter(Boolean)
      .join(",")}`;

    let updatedValues = {
      recurrence,
      repaymentReschedulingEnum: values.repaymentReschedulingEnum,
      extendTermDailyRepayments: values.extendTermDailyRepayments,
    };

    updateWorkingDays(updatedValues, {
      onSuccess: () => {
        setSubmitLoader(false);
        toast({
          type: "success",
          response: `Working Days updated successfully.`,
        });
      },
      onError(error, variables, context) {
        toast({ type: "error", response: error });
        setSubmitLoader(false);
      },
    });
  }

  return (
    <>
      <PageHeader pageTitle={`Working Days`} />
      {canRead ? (
        <div className="w-1/3">
          <Form
            layout="vertical"
            form={form}
            name={PAGE_TITLE}
            onFinish={onFinish}
            className="grid grid-cols-2 gap-2"
          >
            {canUpdate ? (
              <>
                <Form.Item
                  className="col-span-2"
                  name="monday"
                  valuePropName="checked"
                >
                  <Checkbox>Monday</Checkbox>
                </Form.Item>
                <Form.Item
                  className="col-span-2"
                  name="tuesday"
                  valuePropName="checked"
                >
                  <Checkbox>Tuesday</Checkbox>
                </Form.Item>
                <Form.Item
                  className="col-span-2"
                  name="wednesday"
                  valuePropName="checked"
                >
                  <Checkbox>Wednesday</Checkbox>
                </Form.Item>
                <Form.Item
                  className="col-span-2"
                  name="thursday"
                  valuePropName="checked"
                >
                  <Checkbox>Thursday</Checkbox>
                </Form.Item>
                <Form.Item
                  className="col-span-2"
                  name="friday"
                  valuePropName="checked"
                >
                  <Checkbox>Friday</Checkbox>
                </Form.Item>
                <Form.Item
                  className="col-span-2"
                  name="saturday"
                  valuePropName="checked"
                >
                  <Checkbox>Saturday</Checkbox>
                </Form.Item>
                <Form.Item
                  className="col-span-2"
                  name="sunday"
                  valuePropName="checked"
                >
                  <Checkbox>Sunday</Checkbox>
                </Form.Item>
              </>
            ) : (
              renderDayList(
                workingDay?.[0]?.recurrence
                  ?.split(";")
                  .find((item) => item.startsWith("BYDAY="))
                  ?.replace("BYDAY=", "")
                  .split(",") || []
              )
            )}

            <Form.Item
              className="col-span-2"
              name="repaymentReschedulingEnum"
              label="Payments Due on non Working Days"
            >
              <Select allowClear disabled={!canUpdate}>
                <option value={"SAME DAY"}>Same day</option>
                <option value={"MOVE TO NEXT WORKING DAY"}>
                  Move to next working day
                </option>
                <option value={"MOVE TO NEXT REPAYMENT MEETING DAY"}>
                  Move to next repayment meeting day
                </option>
                <option value={"MOVE TO PREVIOUS DAY"}>
                  Move to previous day
                </option>
              </Select>
            </Form.Item>

            <Form.Item
              className="col-span-2"
              name="extendTermDailyRepayments"
              valuePropName="checked"
            >
              <Checkbox disabled={!canUpdate}>
                Extend the term for loans
              </Checkbox>
            </Form.Item>

            {canUpdate && (
              <div className="col-span-2">
                <FormSubmitButtons
                  submitLoader={submitLoader}
                  onReset={onReset}
                />
              </div>
            )}
          </Form>
        </div>
      ) : (
        <AccessDenied />
      )}
    </>
  );
}
