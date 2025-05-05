import { useCreate, useGet, useGetById, usePatch } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { GLAccount, SubmitType, TaxComponent } from "@/types";
import { dateFormat } from "@/utils/dates";
import { filterOption } from "@/utils/strings";
import { DatePicker, Form, Input, InputNumber, Select } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { ENDPOINT, PAGE_TITLE, QUERY_KEY } from "./constants";
import { useParams } from "next/navigation";
import toast from "@/utils/toast";

export default function CreateForm(props: {
  submitType?: SubmitType;
  id?: number;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { tenantId } = useParams();
  const { submitType = "create", id, setIsModalOpen } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);

  const { mutate: insertTaxComponent } = useCreate(`${tenantId}/${ENDPOINT}`, [
    `${tenantId}/${QUERY_KEY}`,
  ]);
  const { mutate: updateTaxComponent } = usePatch(
    `${tenantId}/${ENDPOINT}`,
    id,
    [`${tenantId}/${QUERY_KEY}`]
  );

  const {
    status: glAccountStatus,
    data: glAccounts,
    error: glAccountsError,
  } = useGet<GLAccount[]>(`${tenantId}/gl-accounts`, [
    `${tenantId}/gl-accounts`,
  ]);

  let glAccountsOptions: any = [];

  if (glAccountStatus === "success") {
    glAccountsOptions = glAccounts.map((account: GLAccount) => {
      return {
        value: account.id,
        label: `${account.type.codeValue} (${account.glCode}) ${account.name}`,
      };
    });
  }

  const onReset = () => {
    form.resetFields();
  };

  const {
    status: taxComponentStatus,
    data: taxComponent,
    error: taxComponentError,
  } = useGetById<TaxComponent>(`${tenantId}/${ENDPOINT}`, id);

  useEffect(() => {
    if (
      submitType === "update" &&
      taxComponentStatus === "success" &&
      taxComponent
    ) {
      form.setFieldsValue({
        name: taxComponent.name,
        percentage: taxComponent.percentage,
        debitAccountId: taxComponent.debitAccount?.id,
        creditAccountId: taxComponent.creditAccount?.id,
        startDate: dayjs(taxComponent.startDate),
      });
    }
  }, [submitType, taxComponentStatus, taxComponent, form]);

  function onFinish(values: any) {
    setSubmitLoader(true);

    const submitTypeMessage = submitType === "create" ? "created" : "updated";

    if (!values.debitAccountId) {
      delete values["debitAccountId"];
    }

    if (!values.debitAccountId) {
      delete values["creditAccountId"];
    }

    if (submitType === "create") {
      insertTaxComponent(values, {
        onSuccess: () => {
          setSubmitLoader(false);
          setIsModalOpen(false);

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
      updateTaxComponent(
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

  return (
    <Form
      layout="vertical"
      form={form}
      name={`${PAGE_TITLE}${id}`}
      onFinish={onFinish}
      className="grid grid-cols-2 gap-2"
    >
      <>
        <Form.Item
          className="col-span-2"
          name="name"
          label="Name"
          rules={[{ required: true, message: "Name is required!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          className="col-span-2"
          name="percentage"
          label="Percentage"
          rules={[{ required: true, message: "Percentage is required!" }]}
        >
          <InputNumber className="w-full" min={0} max={100} />
        </Form.Item>

        <Form.Item
          className="col-span-2"
          name="debitAccountId"
          label="Debit Account"
        >
          <Select
            allowClear
            options={glAccountsOptions}
            showSearch
            filterOption={filterOption}
          ></Select>
        </Form.Item>

        <Form.Item
          className="col-span-2"
          name="creditAccountId"
          label="Credit Account"
        >
          <Select
            allowClear
            options={glAccountsOptions}
            showSearch
            filterOption={filterOption}
          ></Select>
        </Form.Item>

        <Form.Item
          className="col-span-2"
          label="Start Date"
          name={"startDate"}
          rules={[{ required: true, message: "Start Date is required!" }]}
        >
          <DatePicker
            className="w-full"
            maxDate={dayjs()}
            format={dateFormat}
          />
        </Form.Item>

        <div className="col-span-2 ">
          <FormSubmitButtons submitLoader={submitLoader} onReset={onReset} />
        </div>
      </>
    </Form>
  );
}
