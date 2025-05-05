"use client";
import { get, useGet, useCreate, usePatch } from "@/api";
import FormSubmitButtonsStep from "@/components/form-submit-buttons-step";
import { Checkbox, DatePicker, Form, Input, Select } from "antd";
import dayjs from "dayjs";
import { SetStateAction, useEffect, useState } from "react";
import { PAGE_TITLE } from "./constants";
import {
  Client,
  Code,
  CodeValue,
  Employee,
  Office,
  SavingsProduct,
  SubmitType,
} from "@/types";
import { filterOption } from "@/utils/strings";
import { dateFormat } from "@/utils/dates";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import { useParams, useRouter } from "next/navigation";
import toast from "@/utils/toast";
import { removeKeysFromObject } from "@/utils/arrays";

const ClientForm = (props: {
  submitType: SubmitType;
  officeId?: number;
  current: number;
  setCurrent: (value: React.SetStateAction<number>) => void;
  formValues: Partial<Client>;
  setFormValues: React.Dispatch<SetStateAction<Partial<Client>>>;
  id?: number;
  isLastStep?: boolean;
  showPersonInputs: boolean;
  setShowPersonInputs: React.Dispatch<SetStateAction<Partial<boolean>>>;
  showEntityInputs: boolean;
  setShowEntityInputs: React.Dispatch<SetStateAction<Partial<boolean>>>;
  onChangeLegalForm: (value: "PERSON" | "ENTITY") => void;
}) => {
  const { tenantId } = useParams();
  const router = useRouter();
  const {
    submitType,
    current,
    setCurrent,
    formValues,
    setFormValues,
    officeId,
    id,
    setShowPersonInputs,
    setShowEntityInputs,
    onChangeLegalForm,
    showEntityInputs,
    showPersonInputs,
    isLastStep,
  } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);
  const [showOpenSavingsAccountInputs, setShowOpenSavingsAccountInputs] =
    useState(false);
  const [employeesOptions, setEmployeesOptions] = useState<any[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [legalForm, setLegalForm] = useState<"PERSON" | "ENTITY">("PERSON");

  const { mutate: insertClient } = useCreate(`${tenantId}/clients`, [
    `${tenantId}/clients`,
  ]);
  const { mutate: updateClient } = usePatch(`${tenantId}/clients`, id, [
    `${tenantId}/clients`,
  ]);

  const { status: officesStatus, data: offices } = useGet<Office[]>(
    `${tenantId}/offices`,
    [`${tenantId}/offices`]
  );
  const selectOfficeOptions: any =
    officesStatus === "success"
      ? offices.map((office: Office) => ({
          value: office.id,
          label: office.name,
        }))
      : [];

  const { status: savingsProductsStatus, data: savingsProducts } = useGet<
    SavingsProduct[]
  >(
    `${tenantId}/savings-products?filter={"where":{"depositTypeEnum":"SAVING DEPOSIT"}}`,
    [`${tenantId}/savings-products`]
  );

  const savingsProductsOptions: any =
    savingsProductsStatus === "success"
      ? savingsProducts.map((savingsProduct: SavingsProduct) => ({
          value: savingsProduct.id,
          label: savingsProduct.name,
        }))
      : [];

  useEffect(() => {
    form.setFieldsValue(formValues);

    if (submitType === "update") {
      form.setFieldsValue({
        ...formValues,
        incorporationDate: formValues.incorporationDate
          ? dayjs(formValues.incorporationDate)
          : null,
        incorporationValidityTillDate: formValues.incorporationValidityTillDate
          ? dayjs(formValues.incorporationValidityTillDate)
          : null,
        activationDate: formValues.activationDate
          ? dayjs(formValues.activationDate)
          : null,
        mobileNo: formValues.phoneNumbers?.[0]?.number || "",
        mobileNo2: formValues.phoneNumbers?.[1]?.number || "",
        email: formValues.emails?.[0]?.email || "",
        isOpenSavingsAccount: formValues.isOpenSavingsAccount || false,
      });

      if (formValues.isOpenSavingsAccount) {
        setShowOpenSavingsAccountInputs(true);
      }

      if (formValues.legalFormEnum === "ENTITY") {
        setShowPersonInputs(false);
        setShowEntityInputs(true);
        setLegalForm("ENTITY");
      }

      if (formValues.officeId) {
        fetchStaff(formValues.officeId);
      }
    }
  }, [formValues, submitType, form]);

  const fetchStaff = async (officeId: number) => {
    form.resetFields(["staffId"]);
    setStaffLoading(true);
    await get(
      `${tenantId}/staff?filter={"where":{"officeId":${officeId},"isActive":true}}`
    )
      .then((res) => {
        const staff: Employee[] = res.data;
        const staffOptions = staff.map((employee) => {
          const m = employee.middleName ? `${employee.middleName} ` : "";
          return {
            value: employee.id,
            label: `${employee.firstName} ${m}${employee.lastName}`,
          };
        });
        setEmployeesOptions(staffOptions);
        setStaffLoading(false);
      })
      .catch(() => {
        setStaffLoading(false);
      });
  };

  useEffect(() => {
    if (officeId) {
      fetchStaff(officeId);
      form.setFieldsValue({
        officeId,
      });
    }
  }, [officeId]);

  const prepareSubmitData = (values: Client) => {
    let statusEnum = "PENDING";
    if (values.isActive === true) {
      statusEnum = "ACTIVE";
    }

    let updatedValues: any = {
      client: { ...values, statusEnum },
    };

    let phoneNumbers: any[] = [];
    let emails: any[] = [];
    if (values.mobileNo) {
      phoneNumbers.push({ number: values.mobileNo });
    }
    if (values.mobileNo2) {
      phoneNumbers.push({ number: values.mobileNo2 });
    }
    if (values.email) {
      emails.push({ email: values.email });
    }
    updatedValues["phoneNumbers"] = phoneNumbers;
    updatedValues["emails"] = emails;

    delete updatedValues["client"]["image"];
    delete updatedValues["client"]["emails"];
    delete updatedValues["client"]["phoneNumbers"];
    delete updatedValues["client"]["email"];
    delete updatedValues["client"]["mobileNo"];
    delete updatedValues["client"]["mobileNo2"];

    if (values.legalFormEnum === "ENTITY") {
      delete updatedValues["client"]["firstName"];
      delete updatedValues["client"]["lastName"];
      delete updatedValues["client"]["middleName"];
      delete updatedValues["client"]["dateOfBirth"];
    }

    let clientValues = removeKeysFromObject(updatedValues.client, ["office"]);
    clientValues = removeKeysFromObject(clientValues, ["staff"]);

    return {
      ...updatedValues,
      client: { ...clientValues },
      ...(officeId ? { officeId } : {}),
    };
  };

  const handleSubmit = (values: Client) => {
    setSubmitLoader(true);
    const submitTypeMessage = submitType === "create" ? "created" : "updated";
    const clientValues = prepareSubmitData(values);

    if (submitType === "create") {
      insertClient(clientValues, {
        onSuccess: (data) => {
          const response: any = data;
          toast({
            type: "success",
            response: `${PAGE_TITLE} ${submitTypeMessage} successfully.`,
          });
          router.push(`/${tenantId}/clients/${response.id}`);
          form.resetFields();
        },
        onError: (error) => {
          toast({ type: "error", response: error });
        },
        onSettled: () => {
          setSubmitLoader(false);
        },
      });
    } else {
      updateClient(clientValues, {
        onSuccess: () => {
          toast({
            type: "success",
            response: `${PAGE_TITLE} ${submitTypeMessage} successfully.`,
          });
        },
        onError: (error) => {
          toast({ type: "error", response: error });
        },
        onSettled: () => {
          setSubmitLoader(false);
        },
      });
    }
  };

  const onFinish = (values: Client) => {
    setFormValues({ ...formValues, ...values });

    if (legalForm === "ENTITY") {
      handleSubmit(values);
    } else {
      setSubmitLoader(true);
      setTimeout(() => {
        setSubmitLoader(false);
        setCurrent(current + 1);
      }, 500);
    }
  };

  const handleLegalFormChange = (value: "PERSON" | "ENTITY") => {
    setLegalForm(value);
    onChangeLegalForm(value);
  };

  const {
    status: clientTypesStatus,
    data: clientTypes,
    error: clientTypesError,
  } = useGet<Code[]>(
    `${tenantId}/codes?filter={"where":{"name":"client-type"}}`,
    [`${tenantId}/codes?filter={"where":{"name":"client-type"}}`]
  );

  let clientTypeOptions: any = [];

  if (clientTypesStatus === "success") {
    if (clientTypes[0]?.codeValues) {
      clientTypeOptions = clientTypes[0]?.codeValues
        .sort((a: CodeValue, b: CodeValue) => a.orderPosition - b.orderPosition)
        .filter(
          (code: CodeValue) =>
            code.isActive && code.tenantId === Number(tenantId)
        )
        .map((code: CodeValue) => ({
          value: code.id,
          label: code.codeValue,
        }));
    }
  }

  const {
    status: clientClassificationStatus,
    data: clientClassifications,
    error: clientClassificationError,
  } = useGet<Code[]>(
    `${tenantId}/codes?filter={"where":{"name":"client-classification"}}`,
    [`${tenantId}/codes?filter={"where":{"name":"client-classification"}}`]
  );

  let clientClassificationOptions: any = [];

  if (clientClassificationStatus === "success") {
    if (clientClassifications[0]?.codeValues) {
      clientClassificationOptions = clientClassifications[0]?.codeValues
        .sort((a: CodeValue, b: CodeValue) => a.orderPosition - b.orderPosition)
        .filter(
          (code: CodeValue) =>
            code.isActive && code.tenantId === Number(tenantId)
        )
        .map((code: CodeValue) => {
          return { value: code.id, label: code.codeValue };
        });
    }
  }

  const onChangeOpenSavingsAccount = (e: CheckboxChangeEvent) => {
    setShowOpenSavingsAccountInputs(e.target.checked);
  };

  return (
    <Form
      layout="vertical"
      form={form}
      name={`${PAGE_TITLE}${id}`}
      onFinish={onFinish}
      className="text-left grid grid-cols-12 gap-2"
    >
      <Form.Item
        className="col-span-4"
        name="officeId"
        label="Office"
        rules={[{ required: true, message: "Office is required!" }]}
      >
        <Select
          disabled={submitType === "update" || officeId ? true : false}
          options={selectOfficeOptions}
          allowClear
          showSearch
          filterOption={filterOption}
          notFoundContent={officesStatus === "success" ? "Loading..." : null}
          onChange={fetchStaff}
        />
      </Form.Item>

      <Form.Item label="Staff" name="staffId" className="col-span-4">
        <Select
          filterOption={filterOption}
          allowClear
          showSearch
          options={employeesOptions}
          loading={staffLoading}
        />
      </Form.Item>

      <Form.Item
        className="col-span-4"
        label="Legal Form"
        name="legalFormEnum"
        rules={[{ required: true, message: "Legal Form is required!" }]}
      >
        <Select onChange={handleLegalFormChange}>
          <option value={"PERSON"}>Person</option>
          <option value={"ENTITY"}>Entity</option>
        </Select>
      </Form.Item>

      {showPersonInputs && (
        <>
          <Form.Item
            className="col-span-4"
            label="First Name"
            name="firstName"
            rules={[{ required: true, message: "First Name is required!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            className="col-span-4"
            label="Last Name"
            name="lastName"
            rules={[{ required: true, message: "Last Name is required!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            className="col-span-4"
            label="Middle Name"
            name="middleName"
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Date Of Birth"
            className="col-span-4"
            name="dateOfBirth"
          >
            <DatePicker
              className="w-full"
              maxDate={dayjs()}
              format={dateFormat}
            />
          </Form.Item>

          <Form.Item label="Gender" className="col-span-4" name="genderEnum">
            <Select>
              <option value={"MALE"}>Male</option>
              <option value={"FEMALE"}>Female</option>
            </Select>
          </Form.Item>

          <Form.Item
            className="col-span-4"
            label="National Id"
            name="externalId"
            rules={[
              {
                required: true,
                message: "National ID is required",
              },
              {
                pattern: /^(CM|CF)[A-Za-z0-9]{12}$/,
                message: "CF010195123ABC",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            className={`col-span-12 flex justify-start items-baseline`}
            name="isStaff"
            valuePropName="checked"
            label={" "}
          >
            <Checkbox>Is Staff</Checkbox>
          </Form.Item>
        </>
      )}

      {showEntityInputs && (
        <>
          <Form.Item
            className="col-span-4"
            label="Name"
            name="fullName"
            rules={[{ required: true, message: "Name is required!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Incorporation Date"
            className="col-span-4"
            name="incorporationDate"
          >
            <DatePicker
              className="w-full"
              maxDate={dayjs()}
              format={dateFormat}
            />
          </Form.Item>

          <Form.Item
            label="Incorporation Validity Till Date"
            className="col-span-4"
            name="incorporationValidityTillDate"
            rules={[
              {
                validator: (_, value) => {
                  const incorporationDate =
                    form.getFieldValue("incorporationDate");
                  if (
                    !value ||
                    !incorporationDate ||
                    dayjs(value).isAfter(incorporationDate) ||
                    dayjs(value).isSame(incorporationDate)
                  ) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(
                      "Incorporation Validity Till Date must be greater than or equal to Incorporation Date!"
                    )
                  );
                },
              },
            ]}
          >
            <DatePicker className="w-full" format={dateFormat} />
          </Form.Item>

          <Form.Item
            className="col-span-4"
            label="Incorporation Number"
            name="incorporationNumber"
          >
            <Input />
          </Form.Item>

          <Form.Item
            className="col-span-4"
            label="Registration Number"
            name="registrationNumber"
          >
            <Input />
          </Form.Item>

          <Form.Item
            className={`col-span-12 flex justify-start items-baseline`}
            name="isStaff"
            valuePropName="checked"
            label={" "}
          >
            <Checkbox>Is Staff</Checkbox>
          </Form.Item>
        </>
      )}

      <Form.Item
        label="Mobile Number"
        className="col-span-4"
        name="mobileNo"
        rules={[
          {
            pattern: /^0\d{9}$/,
            message: "Mobile number must start with 0 and be exactly 10 digits",
          },
        ]}
      >
        <Input
          maxLength={10}
          minLength={10}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "");
            form.setFieldsValue({ mobileNo: value });
          }}
        />
      </Form.Item>

      <Form.Item
        label="Mobile Number 2"
        className="col-span-4"
        name="mobileNo2"
        rules={[
          {
            pattern: /^0\d{9}$/,
            message: "Mobile number must start with 0 and be exactly 10 digits",
          },
        ]}
      >
        <Input
          maxLength={10}
          minLength={10}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "");
            form.setFieldsValue({ mobileNo2: value });
          }}
        />
      </Form.Item>

      <Form.Item
        label="Email"
        className="col-span-4"
        name="email"
        rules={[{ type: "email" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item label="Client Type" className="col-span-4" name="clientTypeId">
        <Select
          allowClear
          showSearch
          options={clientTypeOptions}
          filterOption={filterOption}
        />
      </Form.Item>

      <Form.Item
        label="Classification"
        className="col-span-4"
        name="clientClassificationId"
      >
        <Select
          allowClear
          showSearch
          options={clientClassificationOptions}
          filterOption={filterOption}
        />
      </Form.Item>

      <Form.Item
        label="Submitted On"
        className="col-span-4 "
        name="submittedOnDate"
        rules={[{ required: true, message: "Submitted On is required!" }]}
        initialValue={dayjs()}
      >
        <DatePicker className="w-full" maxDate={dayjs()} format={dateFormat} />
      </Form.Item>

      <Form.Item
        className="col-span-4 flex justify-start items-baseline"
        name="isActive"
        valuePropName="checked"
        label={" "}
      >
        <Checkbox>Active</Checkbox>
      </Form.Item>

      {submitType === "create" && (
        <>
          <Form.Item
            className="col-span-4 flex justify-start items-baseline"
            name="isOpenSavingsAccount"
            valuePropName="checked"
            label={" "}
          >
            <Checkbox onChange={onChangeOpenSavingsAccount}>
              Open Savings Account?
            </Checkbox>
          </Form.Item>
        </>
      )}

      {showOpenSavingsAccountInputs && (
        <Form.Item
          className="col-span-4"
          name="savingsProductId"
          label="Savings Product"
          rules={[{ required: true, message: "Savings Product is required!" }]}
        >
          <Select
            filterOption={filterOption}
            allowClear
            showSearch
            options={savingsProductsOptions}
          />
        </Form.Item>
      )}

      <Form.Item className="col-span-12">
        {legalForm === "PERSON" ? (
          <FormSubmitButtonsStep
            submitText="Next"
            submitLoader={submitLoader}
            onReset={() => form.resetFields()}
          />
        ) : (
          <FormSubmitButtonsStep
            submitText="Submit"
            submitLoader={submitLoader}
            onReset={() => form.resetFields()}
          />
        )}
      </Form.Item>
    </Form>
  );
};

export default ClientForm;
