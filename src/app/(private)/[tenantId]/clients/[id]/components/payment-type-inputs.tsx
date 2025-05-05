"use client";

import { Form, Input, Select, Switch } from "antd";

export default function PaymentTypeInputs(props: {
  filterOption: any;
  paymentTypeOptions: any;
  onChangeShowPaymentType: any;
  showPaymentTypeInputs: any;
}) {
  const {
    filterOption,
    paymentTypeOptions,
    onChangeShowPaymentType,
    showPaymentTypeInputs,
  } = props;

  return (
    <>
      <Form.Item
        className="col-span-1"
        name="paymentTypeId"
        label="Payment Type"
      >
        <Select
          allowClear
          showSearch
          filterOption={filterOption}
          options={paymentTypeOptions}
        />
      </Form.Item>

      <div className="flex justify-start items-center gap-2 col-span-2">
        <label>Show Payment Details</label>
        <Switch
          defaultChecked={false}
          onChange={onChangeShowPaymentType}
          size="small"
          className="w-4"
        />
      </div>

      {showPaymentTypeInputs && (
        <>
          <Form.Item
            className="col-span-1"
            name="accountNumber"
            label="Account #"
          >
            <Input />
          </Form.Item>

          <Form.Item className="col-span-1" name="checkNumber" label="Cheque #">
            <Input />
          </Form.Item>

          <Form.Item
            className="col-span-1"
            name="routingCode"
            label="Routing Code"
          >
            <Input />
          </Form.Item>

          <Form.Item
            className="col-span-1"
            name="receiptNumber"
            label="Receipt #"
          >
            <Input />
          </Form.Item>

          <Form.Item className="col-span-1" name="bankNumber" label="Bank #">
            <Input />
          </Form.Item>
        </>
      )}
    </>
  );
}
