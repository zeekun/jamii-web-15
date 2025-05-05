"use client";
import { get, useCreate, useGet, useGetById, usePatchV2 } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { Employee, Office, Role, SubmitType, User, UserTenant } from "@/types";
import { Form, Input, Select } from "antd";
import { useEffect, useState } from "react";
import { ENDPOINT } from "./constants";
import { useParams, useRouter } from "next/navigation";
import { filterOption } from "@/utils/strings";
import toast from "@/utils/toast";
import Loading from "@/components/loading";
import Alert_ from "@/components/alert";

const { Option } = Select;
export default function CreateForm(props: {
  submitType?: SubmitType;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  id?: number;
  userRoles?: string[];
}) {
  const { tenantId } = useParams();
  const { submitType = "create", id, userRoles, setIsModalOpen } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);
  const [employeesOptions, setEmployeesOptions] = useState<any[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [selectedOfficeId, setSelectedOfficeId] = useState<number | null>(null);
  const router = useRouter();

  const { mutate: insertUser } = useCreate(`${tenantId}/${ENDPOINT}`, [
    `${tenantId}/users?filter={"order":["id DESC"]}`,
  ]);
  const { mutate: updateUser } = usePatchV2(`${tenantId}/${ENDPOINT}`, id, [
    `${tenantId}/users/${id}`,
    `${tenantId}/auth-policies/roles/user/${id}`,
    `${tenantId}/users?filter={"order":["id DESC"]}`,
  ]);

  const {
    status: userStatus,
    data: user,
    error: userError,
  } = useGetById<UserTenant>(`${tenantId}/${ENDPOINT}`, id);

  const {
    status: rolesStatus,
    data: roles,
    error: rolesError,
  } = useGet<Role[]>(
    `${tenantId}/roles?filter={"where":{"isDisabled":false}}`,
    [`${tenantId}/roles?filter={"where":{"isDisabled":false}}`]
  );

  const {
    status: officesStatus,
    data: offices,
    error: officesError,
  } = useGet<Office[]>(`${tenantId}/offices`, [`${tenantId}/offices`]);

  let rolesOptions: any = [];
  let officeOptions: any = [];

  if (rolesStatus === "success") {
    rolesOptions = roles.map((role: Role) => ({
      value: role.name,
      label: role.name,
    }));
  }

  if (officesStatus === "success") {
    officeOptions = offices.map((office: Office) => ({
      value: office.id,
      label: office.name,
    }));
  }

  useEffect(() => {
    if (submitType === "update" && userStatus === "success" && user) {
      // Find office that matches the current tenantId
      const userOffice = user.user?.offices?.find(
        (office) => office.tenantId === Number(tenantId)
      );
      // Find staff that matches the current tenantId
      const userStaff = user.user?.staff?.find(
        (staff) => staff.tenantId === Number(tenantId)
      );

      const initialValues = {
        firstName: user.user.person.firstName,
        lastName: user.user.person.lastName,
        phoneNumber: user.user.phoneNumber?.replace("256", "0"),
        email: user.user.email,
        officeId: userOffice?.id, // Use office matching tenantId
        roles: userRoles,
        username: user.user.username,
        staffId: userStaff?.id, // Use staff matching tenantId
      };

      form.setFieldsValue(initialValues);

      if (userOffice?.id) {
        setSelectedOfficeId(userOffice.id);
        loadStaffMembers(userOffice.id, userStaff?.id);
      }
    }
  }, [submitType, userStatus, user, form]);

  const loadStaffMembers = async (
    officeId: number,
    selectedStaffId?: number
  ) => {
    setStaffLoading(true);
    try {
      const res = await get(
        `${tenantId}/staff?filter={"where":{"officeId":${officeId},"isActive":true}}`
      );
      const staff: Employee[] = res.data;
      const staffOptions = staff.map((employee) => ({
        value: employee.id,
        label: `${employee.firstName} ${
          employee.middleName ? `${employee.middleName} ` : ""
        }${employee.lastName}`,
      }));
      setEmployeesOptions(staffOptions);

      // If this is an update and we have a selected staffId, ensure it's in the options
      if (selectedStaffId && !staff.some((s) => s.id === selectedStaffId)) {
        form.setFieldsValue({ staffId: null });
      }
    } catch (error) {
      console.error("Failed to load staff members:", error);
    } finally {
      setStaffLoading(false);
    }
  };

  const onOfficeChange = (officeId: number) => {
    setSelectedOfficeId(officeId);
    form.setFieldsValue({ staffId: null });
    loadStaffMembers(officeId);
  };

  const onReset = () => {
    form.resetFields();
    setSelectedOfficeId(null);
    setEmployeesOptions([]);
  };

  async function onFinish(values: any) {
    setSubmitLoader(true);
    const submitTypeMessage = submitType === "create" ? "created" : "updated";

    try {
      const roles = values.roles.map((role: string) => ({ v1: role }));

      const userData = {
        person: {
          firstName: values.firstName,
          lastName: values.lastName,
        },
        user: {
          username: values.username,
          ...(values.email && { email: values.email }),
          ...(values.phoneNumber && {
            phoneNumber: values.phoneNumber.replace("0", "256"),
          }),
        } as User,
        roles,
        officeId: values.officeId,
        staffId: values.staffId || null,
      };

      if (submitType === "create") {
        insertUser(userData, {
          onSuccess: (response: any) => {
            handleSuccess(response, submitTypeMessage);
            router.push(`users/${response.id}`);
          },
          onError: handleError,
        });
      } else {
        updateUser(
          { id, ...userData },
          {
            onSuccess: () => handleSuccess(null, submitTypeMessage),
            onError: handleError,
          }
        );
      }
    } catch (error) {
      handleError(error);
    }
  }

  const handleSuccess = (response: any, message: string) => {
    setSubmitLoader(false);
    setIsModalOpen(false);
    toast({
      type: "success",
      response: `User ${message} successfully.`,
    });
  };

  const handleError = (error: any) => {
    toast({ type: "error", response: error });
    setSubmitLoader(false);
  };

  if (
    userStatus === "pending" ||
    officesStatus === "pending" ||
    rolesStatus === "pending"
  ) {
    return <Loading />;
  }

  if (userStatus === "error") {
    return (
      <Alert_
        message={"Error"}
        description={userError.message}
        type={"error"}
      />
    );
  }

  return (
    <Form
      layout="vertical"
      form={form}
      name={submitType === "create" ? submitType : `${submitType}${id}`}
      onFinish={onFinish}
      className="grid grid-cols-4 gap-2"
    >
      <Form.Item
        className="col-span-2"
        name="firstName"
        label="First Name"
        rules={[{ required: true, message: "First Name is required!" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        className="col-span-2"
        name="lastName"
        label="Last Name"
        rules={[{ required: true, message: "Last Name is required!" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        className="col-span-2"
        name="officeId"
        label="Office"
        rules={[{ required: true, message: "Office is required!" }]}
      >
        <Select
          filterOption={filterOption}
          showSearch
          allowClear
          options={officeOptions}
          //loading={officesStatus === "pending"}
          onChange={onOfficeChange}
        />
      </Form.Item>

      <Form.Item
        label="Staff"
        name="staffId"
        className="col-span-2"
        dependencies={["officeId"]}
      >
        <Select
          filterOption={filterOption}
          allowClear
          showSearch
          options={employeesOptions}
          loading={staffLoading}
          disabled={!selectedOfficeId}
        />
      </Form.Item>
      <Form.Item
        className="col-span-2"
        name="username"
        label="Username"
        rules={[
          { required: true, message: "Username is required!" },
          {
            min: 5,
            message: "The username must be at least 5 characters long",
          },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        className="col-span-2"
        name="phoneNumber"
        label="Phone Number"
        rules={[
          { required: true, message: "Username is required!" },
          {
            pattern: /^0\d{9}$/,
            message: "Phone number must start with 0 and be exactly 10 digits",
          },
        ]}
      >
        <Input maxLength={10} minLength={10} style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item
        className="col-span-2"
        name="email"
        label="Email"
        rules={[{ type: "email" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        className="col-span-4"
        name="roles"
        label="Role(s)"
        rules={[{ required: true, message: "Role is required!" }]}
      >
        <Select
          mode="multiple"
          filterOption={filterOption}
          showSearch
          allowClear
          options={rolesOptions}
          //loading={rolesStatus === "pending" ? true : false}
        />
      </Form.Item>

      <div className="col-span-4 ">
        <FormSubmitButtons submitLoader={submitLoader} onReset={onReset} />
      </div>
    </Form>
  );
}
