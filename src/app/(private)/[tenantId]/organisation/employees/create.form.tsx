"use client";
import { useCreate, useGet, useGetById, usePatch, usePatchV2 } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { Employee, Office, SubmitType } from "@/types";
import { dateFormat } from "@/utils/dates";
import { filterOption } from "@/utils/strings";
import { Checkbox, DatePicker, Form, Input, InputNumber, Select } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { ENDPOINT, PAGE_TITLE, QUERY_KEY } from "./constants";
import CreateFormLoading from "@/components/create-form-loading";
import { useParams, useRouter } from "next/navigation";
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
  const router = useRouter();

  const { mutate: insertEmployee } = useCreate(`${tenantId}/${ENDPOINT}`, [
    `${tenantId}/${QUERY_KEY}`,
  ]);
  const { mutate: updateEmployee } = usePatchV2(`${tenantId}/${ENDPOINT}`, id, [
    `${tenantId}/${QUERY_KEY}`,
    `${tenantId}/staff/${id}`,
    `${tenantId}/staff/${id}/emails`,
    `${tenantId}/staff/${id}/phone-numbers`,
  ]);

  const {
    status: employeeStatus,
    data: employee,
    error: employeeError,
  } = useGetById<Employee>(`${tenantId}/${ENDPOINT}`, id);

  useEffect(() => {
    if (submitType === "update" && employeeStatus === "success" && employee) {
      if (!employee.middleName) delete employee["middleName"];

      form.setFieldsValue({
        firstName: employee.firstName,
        lastName: employee.lastName,
        middleName: employee.middleName,
        officeId: employee.officeId,
        isLoanOfficer: employee.isLoanOfficer,
        isActive: employee.isActive,
        joiningDate: employee.joiningDate ? dayjs(employee.joiningDate) : null,
      });

      if (employee.phoneNumbers) {
        form.setFieldValue("mobileNo", employee.phoneNumbers[0]?.number);

        if (employee.phoneNumbers?.length === 2) {
          form.setFieldValue("mobileNo2", employee.phoneNumbers[1]?.number);
        }
      }

      if (employee.emails) {
        form.setFieldValue("email", employee.emails[0].email);
      }
    }
  }, [submitType, employeeStatus, employee, form]);

  const onReset = () => {
    form.resetFields();
  };

  const {
    status: officesStatus,
    data: offices,
    error: officesError,
  } = useGet<Office[]>(`${tenantId}/offices`, [`${tenantId}/offices`]);

  let selectOfficeOptions: any = [];

  if (officesStatus === "success") {
    selectOfficeOptions = offices.map((office: Office) => {
      return { value: office.id, label: office.name };
    });
  }

  function onFinish(values: any) {
    setSubmitLoader(true);

    const updatedValues: any = {
      staff: values,
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
    delete updatedValues["staff"]["email"];
    delete updatedValues["staff"]["mobileNo"];
    delete updatedValues["staff"]["mobileNo2"];

    const submitTypeMessage = submitType === "create" ? "created" : "updated";

    if (submitType === "create") {
      insertEmployee(updatedValues, {
        onSuccess: (response: any) => {
          setSubmitLoader(false);

          toast({
            type: "success",
            response: `Employee ${submitTypeMessage} successfully.`,
          });
          form.resetFields();
          setIsModalOpen(false);
          router.push(`employees/${response.id}`);
        },
        onError(error, variables, context) {
          toast({ type: "error", response: error });

          setSubmitLoader(false);
        },
      });
    } else {
      updateEmployee(
        { id, ...updatedValues },
        {
          onSuccess: () => {
            setSubmitLoader(false);
            setIsModalOpen(false);
            form.resetFields();
            toast({
              type: "success",
              response: `Employee ${submitTypeMessage} successfully.`,
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
    <CreateFormLoading
      status={employeeStatus}
      error={employeeError}
      form={
        <Form
          className="grid grid-cols-2 gap-2"
          layout="vertical"
          name={`${PAGE_TITLE}${id}`}
          form={form}
          onFinish={onFinish}
        >
          <Form.Item
            className="col-span-1"
            name="firstName"
            label="First Name "
            rules={[{ required: true, message: "First Name is required!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            className="col-span-1"
            name="lastName"
            label="Last Name "
            rules={[{ required: true, message: "Last Name is required!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            className="col-span-1"
            name="middleName"
            label="Middle Name "
          >
            <Input />
          </Form.Item>

          <Form.Item
            className="col-span-1"
            name="officeId"
            label={`Office ${
              officesStatus === "pending" ? "(Loading...)" : ""
            }`}
            rules={[{ required: true, message: "Office is required!" }]}
          >
            <Select
              options={selectOfficeOptions}
              allowClear
              filterOption={filterOption}
              showSearch
            />
          </Form.Item>

          <div className="col-span-2">
            <div className="grid grid-cols-2">
              <Form.Item
                name="isLoanOfficer"
                className="col-span-1"
                label={""}
                valuePropName="checked"
              >
                <Checkbox>Is Loan Staff</Checkbox>
              </Form.Item>
              {submitType === "update" && (
                <Form.Item
                  name="isActive"
                  className="col-span-1"
                  label={""}
                  valuePropName="checked"
                >
                  <Checkbox>Is Active</Checkbox>
                </Form.Item>
              )}
            </div>
          </div>

          <Form.Item
            className="col-span-1"
            name="mobileNo"
            label="Mobile Number"
          >
            <Input
              className="w-full"
              minLength={10}
              maxLength={10}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                form.setFieldsValue({ mobileNo: value });
              }}
            />
          </Form.Item>

          <Form.Item
            className="col-span-1"
            name="mobileNo2"
            label="Mobile Number 2"
          >
            <Input
              className="w-full"
              minLength={10}
              maxLength={10}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                form.setFieldsValue({ mobileNo2: value });
              }}
            />
          </Form.Item>

          <Form.Item
            className="col-span-1"
            name="email"
            label="Email"
            rules={[{ type: "email" }]}
          >
            <Input className="w-full" />
          </Form.Item>

          <Form.Item
            className="col-span-1"
            label="Joining Date"
            name="joiningDate"
            rules={[{ required: true, message: "Joining Date is required!" }]}
          >
            <DatePicker
              className="w-full"
              maxDate={dayjs()}
              format={dateFormat}
            />
          </Form.Item>
          <div className="col-span-2">
            <FormSubmitButtons submitLoader={submitLoader} onReset={onReset} />
          </div>
        </Form>
      }
    />
  );
}
