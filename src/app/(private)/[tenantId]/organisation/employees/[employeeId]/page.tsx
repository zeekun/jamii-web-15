"use client";
import React, { useState } from "react";
import { useCreate, useCreateV3, useGet, usePatchV2 } from "@/api";
import { Email, Employee, PhoneNumber } from "@/types";
import Alert_ from "@/components/alert";
import "@/components/css/Table.css";
import { useParams } from "next/navigation";
import { formattedDate } from "@/utils/dates";
import CreateForm from "../create.form";
import { QUERY_KEY } from "../constants";
import { Avatar, Button, Modal, Skeleton } from "antd";
import {
  DeleteOutlined,
  UploadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import MyButton from "@/components/my-button";
import toast from "@/utils/toast";
import Image from "next/image";
import RecordActions from "@/components/record-actions";
import { useRoles } from "@/providers/RolesProvider";
import { hasPermission } from "@/utils/permissions";

const updatePermissions = ["UPDATE_STAFF", "ALL_FUNCTIONS"];
const readPermissions = ["READ_STAFF", "ALL_FUNCTIONS", "ALL_FUNCTIONS_READ"];
const deletePermissions = ["DELETE_STAFF", "ALL_FUNCTIONS"];

export default function Page() {
  const { tenantId, employeeId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModal1Visible, setIsModal1Visible] = useState(false);
  const [isModal2Visible, setIsModal2Visible] = useState(false);
  const [isModal3Visible, setIsModal3Visible] = useState(false);
  const [staffId, setStaffId] = useState(employeeId);
  const [picture, setPicture] = useState<File | null>(null);
  const [uploadForm, setUploadForm] = useState<"profile" | "signature">();

  const {
    permissions,
    error: permissionsError,
    isPermissionsLoading,
  } = useRoles();

  const canUpdate = hasPermission(permissions, updatePermissions);
  const canRead = hasPermission(permissions, readPermissions);
  const canDelete = hasPermission(permissions, deletePermissions);

  const { mutate: insertProfilePicture } = useCreateV3(`${tenantId}/files`, [
    `${tenantId}/staff/${employeeId}`,
  ]);

  const { mutate: deleteProfilePicture } = usePatchV2(
    `${tenantId}/staff`,
    `${employeeId}`,
    [`${tenantId}/staff/${employeeId}`]
  );

  const {
    status: employeeStatus,
    data: employee,
    error: employeeError,
  } = useGet<Employee>(`${tenantId}/staff/${employeeId}`, [
    `${tenantId}/staff/${employeeId}`,
  ]);

  const {
    status: emailsStatus,
    data: emails,
    error: emailsError,
  } = useGet<Email[]>(`${tenantId}/staff/${employeeId}/emails`, [
    `${tenantId}/staff/${employeeId}/emails`,
  ]);

  const {
    status: phoneNumberStatus,
    data: phoneNumbers,
    error: phoneNumbersError,
  } = useGet<PhoneNumber[]>(`${tenantId}/staff/${employeeId}/phone-numbers`, [
    `${tenantId}/staff/${employeeId}/phone-numbers`,
  ]);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!picture) {
      alert("Please provide picture!");
      return;
    }

    const formData = new FormData();
    formData.append("staffId", `${staffId}`);
    uploadForm === "profile"
      ? formData.append("uploadForm", `profile`)
      : formData.append("uploadForm", `signature`);
    formData.append("picture", picture);

    insertProfilePicture(formData, {
      onSuccess: () => {
        toast({
          type: "success",
          response: `
           Image uploaded successfully.`,
        });
      },
      onError(error, variables, context) {
        toast({ type: "error", response: error });
      },
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPicture(e.target.files[0]);
    }
  };

  function onDelete(id: string) {
    deleteProfilePicture(
      {
        staff: {
          imageId: null,
          //   legalFormEnum: client?.legalFormEnum,
          //   officeId: client?.officeId,
        },
      },
      {
        onSuccess: () => {
          toast({
            type: "success",
            response: `Image deleted successfully.`,
          });
        },
        onError(error, variables, context) {
          toast({ type: "error", response: error });
        },
      }
    );
  }

  const showModal1 = () => {
    setIsModal1Visible(true);
    setUploadForm("profile");
  };

  const showModal3 = () => {
    setIsModal3Visible(true);
    setUploadForm("signature");
  };

  const showModal2 = () => {
    setIsModal2Visible(true);
  };

  const handleOk1 = () => {
    setIsModal1Visible(false);
  };

  const handleOk3 = () => {
    setIsModal3Visible(false);
  };

  const handleCancel1 = () => {
    setIsModal1Visible(false);
  };

  const handleOk2 = () => {
    setIsModal2Visible(false);
  };

  const handleCancel2 = () => {
    setIsModal2Visible(false);
  };

  const handleCancel3 = () => {
    setIsModal3Visible(false);
  };

  if (employeeStatus === "error") {
    return (
      <Alert_
        message={"Error"}
        description={employeeError.message}
        type={"error"}
      />
    );
  }

  if (employeeStatus === "pending") {
    return <Skeleton />;
  }

  if (
    employeeStatus === "success" &&
    phoneNumberStatus === "success" &&
    emailsStatus === "success" &&
    employee
  ) {
    return (
      <>
        <div className="flex gap-3 justify-end text-right">
          <Button type="primary" onClick={showModal3} icon={<UploadOutlined />}>
            Update Signature
          </Button>

          <Modal
            title={"Upload Signature"}
            open={isModal3Visible}
            onOk={handleOk3}
            onCancel={handleCancel3}
            footer={null}
          >
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <input
                type="hidden"
                name="staffId"
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
              />

              <div>
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                />
              </div>
              <div className="mt-5">
                <Button
                  htmlType="submit"
                  type="primary"
                  icon={<UploadOutlined />}
                >
                  Upload
                </Button>
              </div>
            </form>
          </Modal>

          <RecordActions
            actionTitle="employee"
            isModalOpen={isModalOpen}
            redirectUrl={`/${tenantId}/organisation/employees`}
            setIsModalOpen={setIsModalOpen}
            canUpdate={canUpdate}
            canDelete={canDelete}
            id={Number(employeeId)}
            deleteUrl={`${tenantId}/employees`}
            updateForm={
              <CreateForm
                id={Number(employeeId)}
                submitType="update"
                setIsModalOpen={setIsModalOpen}
              />
            }
          />
        </div>

        <div>
          <Avatar
            size={189}
            icon={<UserOutlined />}
            src={`${process.env.NEXT_PUBLIC_API_FILE_SERVER_BASE_URL}uploads/${employee.image?.originalname}`}
          />

          <div className="flex gap-3 ml-16 m-2  ">
            <Button
              size="small"
              type="primary"
              icon={<UploadOutlined />}
              onClick={showModal1}
            />

            <MyButton
              type="danger"
              onClick={showModal2}
              size="small"
              icon={<DeleteOutlined />}
            />

            <Modal
              title={"Upload Profile Picture"}
              open={isModal1Visible}
              onOk={handleOk1}
              onCancel={handleCancel1}
              footer={null}
            >
              <form onSubmit={handleSubmit} encType="multipart/form-data">
                <input
                  type="hidden"
                  name="staffId"
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value)}
                />

                <div>
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleFileChange}
                    required
                  />
                </div>
                <div className="mt-5">
                  <Button
                    htmlType="submit"
                    type="primary"
                    icon={<UploadOutlined />}
                  >
                    Upload
                  </Button>
                </div>
              </form>
            </Modal>

            <Modal
              title="Delete Image"
              open={isModal2Visible}
              onOk={handleOk2}
              onCancel={handleCancel2}
              footer={null}
            >
              <div className="flex justify-end gap-4">
                <Button
                  type="primary"
                  onClick={() => onDelete(`${employeeId}`)}
                >
                  Delete
                </Button>
                <Button type="default">Cancel</Button>
              </div>
            </Modal>
          </div>
        </div>

        <div className=" w-full">
          <table className="text-md text-left w-full">
            <tr className="text-lg">
              <th className="w-[10rem]">Name:</th>
              <td>
                {`${employee.firstName} ${employee.middleName || ""} ${
                  employee.lastName
                }`}
              </td>
            </tr>
            <tr>
              <th>Office:</th>
              <td>{employee.office.name}</td>
            </tr>
            <tr>
              <th>Email:</th>
              <td>
                {emails.map((email, index) => (
                  <span key={index}>
                    {email.email}
                    {index + 1 !== emails.length ? ", " : ""}
                  </span>
                ))}
              </td>
            </tr>
            <tr>
              <th>Phone Number(s):</th>
              <td>
                {phoneNumbers.map((phoneNumber, index) => (
                  <span key={index}>
                    {phoneNumber.number}
                    {index + 1 !== phoneNumbers.length ? ", " : ""}
                  </span>
                ))}
              </td>
            </tr>

            <tr>
              <th>Is Loan Officer:</th>
              <td>{employee.isLoanOfficer ? "Yes" : "No"}</td>
            </tr>
            <tr>
              <th>Active:</th>
              <td>{employee.isActive ? "Yes" : "No"}</td>
            </tr>
            <tr>
              <th>Joined On:</th>
              <td>{formattedDate(employee.joiningDate)}</td>
            </tr>
            <tr>
              <th>Signature:</th>
              <td>
                {employee.signatureImage ? (
                  <Image
                    src={`${process.env.NEXT_PUBLIC_API_FILE_SERVER_BASE_URL}uploads/${employee.signatureImage?.originalname}`}
                    width={250}
                    height={250}
                    alt="Signature Image"
                  />
                ) : (
                  "Not Available"
                )}
              </td>
            </tr>
          </table>
        </div>
      </>
    );
  }

  return null;
}
