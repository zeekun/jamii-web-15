"use client";
import { useGet, useGetById } from "@/api";
import FormSubmitButtonsStep from "@/components/form-submit-buttons-step";
import { Charge, LoanProduct, SubmitType } from "@/types";
import { filterOption } from "@/utils/strings";
import { Button, Form, Select } from "antd";
import { useEffect, useState } from "react";
import ChargesDataTable from "./charges.data-table";
import { PlusOutlined } from "@ant-design/icons";
import { useParams } from "next/navigation";

export default function ChargesForm(props: {
  current: number;
  setCurrent: (value: React.SetStateAction<number>) => void;
  formValues: Partial<LoanProduct>;
  setFormValues: React.Dispatch<React.SetStateAction<Partial<LoanProduct>>>;
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
  const [overdueChargesData, setOverdueChargesData] = useState<Charge[]>([]);
  const [selectedOverdueChargeId, setSelectedOverdueChargeId] = useState<
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
    `${tenantId}/charges?filter={"where":{"and":[{"chargeAppliesToEnum":"LOANS"},{"isActive":true},{"chargeTimeTypeEnum":{"neq":"OVERDUE FEE"}}]}}`,
    [
      `${tenantId}/charges/?filter={"where":{"and":[{"chargeAppliesToEnum":"LOANS"},{"isActive":true},{"chargeTimeTypeEnum":{"neq":"OVERDUE FEE"}}]}}`,
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

  //check if any Terms vary based on loan cycle were added
  useEffect(() => {
    if (
      formValues.loanProductVariationsBorrowerCycles &&
      formValues.loanProductVariationsBorrowerCycles.length > 0
    ) {
      setFormValues({ ...formValues, termsVaryBasedOnLoanCycle: true });
    } else {
      setFormValues({ ...formValues, termsVaryBasedOnLoanCycle: false });
    }
  }, [formValues.loanProductVariationsBorrowerCycles]);

  useEffect(() => {
    if (formValues.charges) {
      const formValuesCharges = formValues.charges.filter(
        (charge) => charge.chargeTimeTypeEnum !== "OVERDUE FEE"
      );
      setChargesData([...formValuesCharges]);
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

  //******************** OVERDUE CHARGES*****************/
  const {
    status: overdueChargesStatus,
    data: overdueCharges,
    error: overdueChargesError,
  } = useGet<Charge[]>(
    `${tenantId}/charges?filter={"where":{"and":[{"chargeAppliesToEnum":"LOANS"},{"isActive":true},{"chargeTimeTypeEnum":"OVERDUE FEE"}]}}`,
    [
      `${tenantId}/charges/?filter={"where":{"and":[{"chargeAppliesToEnum":"LOANS"},{"isActive":true},{"chargeTimeTypeEnum":"OVERDUE FEE"}]}}`,
    ]
  );

  let overdueChargesOptions: any = [];

  if (overdueChargesStatus === "success") {
    overdueChargesOptions = overdueCharges?.map((charge: Charge) => {
      return {
        value: charge.id,
        label: `${charge.name}`,
      };
    });
  }

  const {
    status: selectedOverdueChargeDataStatus,
    data: selectedOverdueChargeData,
    error: selectedOverdueChargeDataError,
  } = useGetById<Charge>(
    `${tenantId}/charges`,
    shouldFetch ? selectedOverdueChargeId : undefined
  );

  useEffect(() => {
    if (formValues.charges) {
      const formValuesCharges = formValues.charges.filter(
        (charge) => charge.chargeTimeTypeEnum === "OVERDUE FEE"
      );
      setOverdueChargesData([...formValuesCharges]);
    }
    if (
      selectedOverdueChargeDataStatus === "success" &&
      selectedOverdueChargeData
    ) {
      if (Object.keys(selectedOverdueChargeData).length > 0) {
        if (
          !overdueChargesData.some(
            (charge) => charge.id === selectedOverdueChargeData.id
          )
        ) {
          const updatedChargesData = [
            ...overdueChargesData,
            selectedOverdueChargeData,
          ];
          setOverdueChargesData(updatedChargesData);

          setFormValues((prevFormValues) => ({
            ...prevFormValues,
            charges: updatedChargesData,
          }));
        }
      } else {
        if (selectedOverdueChargeId !== undefined) {
          setOverdueChargesData([selectedOverdueChargeData]);
          setFormValues((prevFormValues) => ({
            ...prevFormValues,
            charges: [selectedOverdueChargeData],
          }));
        }
      }
    }
  }, [selectedOverdueChargeDataStatus, selectedOverdueChargeData]);

  const onClickOverdueChargeAdd = () => {
    const id = form.getFieldValue("overdueCharges");
    setSelectedOverdueChargeId(id);
  };

  useEffect(() => {
    if (selectedOverdueChargeId !== undefined) {
      setShouldFetch(true);
    }
  }, [selectedOverdueChargeId]);
  //********************** */

  const onFinish = (values: any) => {
    setFormValues({
      ...formValues,
      charges: [...chargesData, ...overdueChargesData],
    });
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
            type="primary"
            className="w-full"
          >
            Add
          </Button>
        </div>
        {chargesData.length > 0 && (
          <div className="col-span-6">
            <ChargesDataTable
              data={chargesData}
              setChargesData={setChargesData}
            />
          </div>
        )}

        <Form.Item
          className="col-span-5 "
          name="overdueCharges"
          label="Overdue Charges"
        >
          <Select
            style={{ width: "100%" }}
            allowClear
            showSearch
            filterOption={filterOption}
            options={overdueChargesOptions}
          />
        </Form.Item>
        <div className="cols-span-1  mt-[1.85rem]">
          <Button
            icon={<PlusOutlined />}
            onClick={onClickOverdueChargeAdd}
            type="primary"
            className="w-full"
          >
            Add
          </Button>
        </div>

        {overdueChargesData.length > 0 && (
          <div className="col-span-6">
            <ChargesDataTable
              data={overdueChargesData}
              setChargesData={setOverdueChargesData}
            />
          </div>
        )}

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
