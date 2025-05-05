"use client";
import { useCreate, useCreateV2, useGet, useGetById, usePatch } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { DatePicker, Form, Input, InputNumber, Select } from "antd";
import { useEffect, useState } from "react";
import { PAGE_TITLE } from "./constants";
import { Cashier, Currency, SubmitType } from "@/types";
import { useParams } from "next/navigation";
import toast from "@/utils/toast";
import { filterOption } from "@/utils/strings";
import { dateFormat } from "@/utils/dates";
import dayjs from "dayjs";
import { formatNumber } from "@/utils/numbers";

export default function AllocateCashForm(props: {
  typeEnum: "ALLOCATE CASH" | "SETTLE CASH";
  officeId: number;
  submitType?: SubmitType;
  id?: number;
  netSum: number;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { tenantId, cashierId } = useParams();
  const {
    submitType = "create",
    id,
    setIsModalOpen,
    typeEnum,
    officeId,
    netSum,
  } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);

  const { mutate: insertCashierTransaction } = useCreateV2(
    `${tenantId}/cashiers/${cashierId}/cashier-transactions`,
    [`${tenantId}/cashiers/${cashierId}/cashier-transactions`]
  );

  const { mutate: updateCashierTransaction } = usePatch(
    `${tenantId}/cashiers`,
    Number(cashierId)
  );

  const {
    status: cashierStatus,
    data: cashier,
    error: cashierError,
  } = useGetById<Cashier>(`${tenantId}/cashiers`, Number(cashierId));

  const {
    status: currenciesStatus,
    data: currencies,
    error: currenciesError,
  } = useGet<Currency[]>(`${tenantId}/currencies`, [`${tenantId}/currencies`]);

  let currenciesOptions: any = [];

  if (currenciesStatus === "success") {
    currenciesOptions = currencies.map((currency: Currency) => {
      return {
        value: currency.code,
        label: currency.name,
      };
    });
  }

  useEffect(() => {
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
    }
  }, [submitType, cashierStatus, cashier, form]);

  const onReset = () => {
    form.resetFields();
  };

  function onFinish(values: any) {
    setSubmitLoader(true);
    const submitTypeMessage = submitType === "create" ? "created" : "updated";

    const updatedValues = {
      transaction: {
        ...values,
        typeEnum,
      },
      officeId,
    };

    if (submitType === "create") {
      insertCashierTransaction(updatedValues, {
        onSuccess: () => {
          setSubmitLoader(false);
          setIsModalOpen(false);
          toast({
            type: "success",
            response: `${typeEnum} ${submitTypeMessage} successfully.`,
          });
          form.resetFields();
        },
        onError(error, variables, context) {
          toast({ type: "error", response: error });

          setSubmitLoader(false);
        },
      });
    } else {
      updateCashierTransaction(
        { id, updatedValues },
        {
          onSuccess: () => {
            setSubmitLoader(false);
            setIsModalOpen(false);
            toast({
              type: "success",
              response: `Cashier ${submitTypeMessage} successfully.`,
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
      name={PAGE_TITLE}
      onFinish={onFinish}
      className="grid grid-cols-2 gap-2"
    >
      <Form.Item
        className="col-span-1"
        label="Date"
        name="date"
        rules={[{ required: true, message: "Date is required!" }]}
      >
        <DatePicker className="w-full" format={dateFormat} />
      </Form.Item>
      <Form.Item
        className="col-span-1"
        name="currencyCode"
        label="Currency"
        rules={[{ required: true, message: "Currency is required!" }]}
      >
        <Select
          allowClear
          showSearch
          filterOption={filterOption}
          options={currenciesOptions}
        />
      </Form.Item>
      <Form.Item
        className="col-span-2"
        name="amount"
        label="Amount"
        rules={[
          { required: true, message: "Amount is required!" },
          () => ({
            validator(_, value) {
              if (!value) {
                // If value is undefined/null/empty, let the required rule handle it
                return Promise.resolve();
              }

              if (
                typeEnum === "SETTLE CASH" &&
                Number(value) > Number(netSum)
              ) {
                return Promise.reject(
                  new Error(
                    `The amount is more than what is available to the cashier ${formatNumber(
                      netSum
                    )}`
                  )
                );
              }
              return Promise.resolve();
            },
          }),
        ]}
      >
        <InputNumber
          className="w-full"
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          parser={(value) => value?.replace(/\$\s?|(,*)/g, "") ?? ""}
        />
      </Form.Item>
      <Form.Item className="col-span-2" name="note" label="Notes/Comments">
        <Input.TextArea rows={2} />
      </Form.Item>
      <div className="col-span-2">
        <FormSubmitButtons submitLoader={submitLoader} onReset={onReset} />
      </div>
    </Form>
  );
}
