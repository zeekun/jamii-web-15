"use group";
import { useGet, usePatch } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { DatePicker, Form, Select } from "antd";
import { useState } from "react";
import { ENDPOINT, PAGE_TITLE } from "../constants";
import dayjs from "dayjs";
import { dateFormat } from "@/utils/dates";
import toast from "@/utils/toast";
import { Group, Code, CodeValue } from "@/types";
import { filterOption } from "@/utils/strings";
import { useParams } from "next/navigation";

export default function CloseForm(props: {
  group?: Group;
  undoClosure?: boolean;
}) {
  const { group, undoClosure = false } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);

  const { tenantId, groupId } = useParams();

  let qk = [`groups/${groupId}`];

  const { mutate: closeGroup } = usePatch(
    `${tenantId}/${ENDPOINT}`,
    Number(groupId),
    qk
  );

  const onReset = () => {
    form.resetFields();
  };

  function onFinish(values: any) {
    setSubmitLoader(true);

    let statusEnum;
    if (undoClosure === false) {
      statusEnum = "CLOSED";
    } else {
      statusEnum = "PENDING";
    }

    let updatedValues = {
      group: {
        ...values,
        officeId: group?.officeId,
        isActive: false,
        statusEnum,
        name: group?.name,
        submittedOnDate: group?.submittedOnDate,
      },
    };

    const successResponse =
      undoClosure === false
        ? "Group successfully closed"
        : "Group closure undone successfully";

    closeGroup(
      { groupId, ...updatedValues },
      {
        onSuccess: () => {
          setSubmitLoader(false);
          toast({
            type: "success",
            response: successResponse,
          });
        },
        onError(error, variables, context) {
          setSubmitLoader(false);
          toast({
            type: "error",
            response: error,
          });
        },
      }
    );
  }

  const {
    status: groupClosureReasonsStatus,
    data: groupClosureReasons,
    error: groupClosureReasonsError,
  } = useGet<Code[]>(
    `${tenantId}/codes?filter={"where":{"name":"group-closure-reason"}}`,
    [`${tenantId}/group-closure-reason-code-values`]
  );

  let groupClosureReasonsOptions: any = [];

  if (groupClosureReasonsStatus === "success") {
    console.log("groupClosureReasons", groupClosureReasons);
    if (groupClosureReasons[0]?.codeValues) {
      groupClosureReasonsOptions = groupClosureReasons[0]?.codeValues
        .sort((a: CodeValue, b: CodeValue) => a.orderPosition - b.orderPosition)
        .filter((code: CodeValue) => code.isActive)
        .map((code: CodeValue) => {
          return { value: code.id, label: code.codeValue };
        });
    }
  }

  return (
    <Form
      layout="vertical"
      form={form}
      name={PAGE_TITLE}
      onFinish={onFinish}
      className="grid grid-cols-2 gap-2"
    >
      {undoClosure === false ? (
        <>
          <Form.Item
            className="col-span-2"
            name="closedOnDate"
            label="Closure Date"
            initialValue={dayjs()}
            rules={[{ required: true, message: "Closure Date is required!" }]}
          >
            <DatePicker
              className="w-full"
              maxDate={dayjs()}
              format={dateFormat}
            />
          </Form.Item>

          <Form.Item
            className="col-span-2"
            name="closureReasonId"
            label="Closure Reason"
            rules={[{ required: true, message: "Closure Reason is required!" }]}
          >
            <Select
              allowClear
              showSearch
              filterOption={filterOption}
              options={groupClosureReasonsOptions}
            />
          </Form.Item>
        </>
      ) : (
        <>
          <Form.Item
            className="col-span-2"
            name="reopenedOnDate"
            label="Re Opened Date"
            initialValue={dayjs()}
            rules={[{ required: true, message: "Re Opened Date is required!" }]}
          >
            <DatePicker
              className="w-full"
              maxDate={dayjs()}
              minDate={dayjs()}
              format={dateFormat}
            />
          </Form.Item>
        </>
      )}

      <div className="col-span-2">
        <FormSubmitButtons submitLoader={submitLoader} onReset={onReset} />
      </div>
    </Form>
  );
}
