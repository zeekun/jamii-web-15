"use client";
import { useGet, useGetById } from "@/api";
import FormSubmitButtonsStep from "@/components/form-submit-buttons-step";
import { Charge, SavingsProduct, SubmitType } from "@/types";
import { filterOption } from "@/utils/strings";
import { Button, Form, Select } from "antd";
import { useEffect, useState } from "react";
import { Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useParams } from "next/navigation";
import ChargesDataTable from "../components/charges-data-table";

const { Title } = Typography;

export default function ChargesForm(props: {
  current: number;
  setCurrent: (value: React.SetStateAction<number>) => void;
  formValues: Partial<SavingsProduct>;
  setFormValues: React.Dispatch<React.SetStateAction<Partial<SavingsProduct>>>;
  submitType: SubmitType;
  id?: number;
}) {
  const { tenantId } = useParams();
  const { current, setCurrent, formValues, setFormValues, submitType, id } =
    props;

  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);
  const [chargesData, setChargesData] = useState<Charge[]>([]);
  const [selectedChargeId, setSelectedChargeId] = useState<
    number | undefined
  >();
  const [shouldFetch, setShouldFetch] = useState(false);

  useEffect(() => {
    form.setFieldsValue(formValues);
  }, [form, formValues]);

  const onReset = () => {
    form.resetFields();
  };

  const {
    status: chargesStatus,
    data: charges,
    error: chargesError,
  } = useGet<Charge[]>(
    `${tenantId}/charges?filter={"where":{"chargeAppliesToEnum":"SHARES","isActive":true}}`,
    [
      `${tenantId}/charges?filter={"where":{"chargeAppliesToEnum":"SHARES","isActive":true}}`,
    ]
  );
  let chargesOptions: any = [];

  if (chargesStatus === "success") {
    chargesOptions = charges?.map((charge: Charge) => {
      return {
        value: charge.id,
        label: `${charge.name}`,
      };
    });
  }

  const {
    status: selectedChargeDataStatus,
    data: selectedChargeData,
    error: selectedChargeDataError,
  } = useGetById<Charge>(
    `${tenantId}/charges`,
    shouldFetch ? selectedChargeId : undefined
  );

  useEffect(() => {
    if (formValues.charges) {
      setChargesData([...formValues.charges]);
    }
    if (selectedChargeDataStatus === "success" && selectedChargeData) {
      if (Object.keys(selectedChargeData).length > 0) {
        if (
          !chargesData.some((charge) => charge.id === selectedChargeData.id)
        ) {
          const updatedChargesData = [...chargesData, selectedChargeData];
          setChargesData(updatedChargesData);

          setFormValues((prevFormValues) => ({
            ...prevFormValues,
            charges: updatedChargesData,
          }));
        }
      } else {
        if (selectedChargeId !== undefined) {
          setChargesData([selectedChargeData]);
          setFormValues((prevFormValues) => ({
            ...prevFormValues,
            charges: [selectedChargeData],
          }));
        }
      }
    }
  }, [selectedChargeDataStatus, selectedChargeData]);

  const onClickChargeAdd = () => {
    const id = form.getFieldValue("charges");
    setSelectedChargeId(id);
  };

  useEffect(() => {
    if (selectedChargeId !== undefined) {
      setShouldFetch(true);
    }
  }, [selectedChargeId]);

  const onFinish = (values: any) => {
    setFormValues({ ...formValues, charges: chargesData });
    setSubmitLoader(true);
    setTimeout(() => {
      setSubmitLoader(false);
      setCurrent(current + 1);
    }, 500);
  };

  return (
    <>
      <Form
        layout="vertical"
        form={form}
        name={"chargesForm"}
        onFinish={onFinish}
        className="grid grid-cols-6 gap-2 text-left"
      >
        <Form.Item className="col-span-5 " name="charges" label="Charges">
          <Select
            style={{ width: "100%" }}
            allowClear
            showSearch
            filterOption={filterOption}
            options={chargesOptions}
          />
        </Form.Item>
        <div className="cols-span-1  mt-[1.85rem]">
          <Button
            icon={<PlusOutlined />}
            onClick={onClickChargeAdd}
            type="default"
            className="w-full"
          >
            Add
          </Button>
        </div>

        <div className="col-span-6">
          <ChargesDataTable
            data={chargesData}
            setChargesData={setChargesData}
          />
        </div>

        <div className="col-span-6 ">
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
    </>
  );
}
