"use client";
import React, { useState } from "react";
import { useGet, useGetById } from "@/api";
import { Email, Office, PhoneNumber } from "@/types";
import Alert_ from "@/components/alert";
import "@/components/css/Table.css";
import { useParams } from "next/navigation";
import { formattedDate } from "@/utils/dates";
import CreateForm from "../create.form";
import AccessDenied from "@/components/access-denied";
import { Skeleton, Typography } from "antd";
import { useRoles } from "@/providers/RolesProvider";
import { hasPermission } from "@/utils/permissions";
import RecordActions from "@/components/record-actions";
const { Title } = Typography;

const updatePermissions = ["UPDATE_OFFICE", "ALL_FUNCTIONS"];
const readPermissions = ["READ_OFFICE", "ALL_FUNCTIONS", "ALL_FUNCTIONS_READ"];

export default function Page() {
  const { tenantId, officeId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    permissions,
    error: permissionsError,
    isPermissionsLoading,
  } = useRoles();

  const canUpdate = hasPermission(permissions, updatePermissions);
  const canRead = hasPermission(permissions, readPermissions);

  const {
    status: officeStatus,
    data: office,
    error: officeError,
  } = useGetById<Office>(`${tenantId}/offices`, `${officeId}`);

  const {
    status: emailsStatus,
    data: emails,
    error: emailsError,
  } = useGet<Email[]>(`${tenantId}/offices/${officeId}/emails`, [
    `${tenantId}/offices/${officeId}/emails`,
  ]);

  const {
    status: phoneNumberStatus,
    data: phoneNumbers,
    error: phoneNumbersError,
  } = useGet<PhoneNumber[]>(`${tenantId}/offices/${officeId}/phone-numbers`, [
    `${tenantId}/offices/${officeId}/emails`,
  ]);

  if (officeStatus === "success") {
    console.log("office", office);
  }

  if (officeStatus === "error") {
    return (
      <Alert_
        message={"Error"}
        description={officeError.message}
        type={"error"}
      />
    );
  }

  if (officeStatus === "pending" || isPermissionsLoading) {
    return <Skeleton />;
  }

  if (permissionsError)
    return (
      <Alert_ message="Error" description={permissionsError} type="error" />
    );

  if (
    officeStatus === "success" &&
    phoneNumberStatus === "success" &&
    emailsStatus === "success" &&
    office
  ) {
    return (
      <>
        {canRead ? (
          <>
            <div className="flex justify-between">
              <Title level={4}>Office</Title>
              <RecordActions
                actionTitle="office"
                isModalOpen={isModalOpen}
                redirectUrl={`/${tenantId}/organisation/offices`}
                setIsModalOpen={setIsModalOpen}
                canUpdate={canUpdate}
                id={Number(officeId)}
                deleteUrl={`${tenantId}/offices`}
                updateForm={
                  <CreateForm
                    id={Number(officeId)}
                    submitType="update"
                    setIsModalOpen={setIsModalOpen}
                  />
                }
              />
            </div>

            <div className=" w-full">
              <table className="text-md text-left w-full">
                <tr className="text-lg">
                  <th className="w-[10rem]">Name:</th>
                  <td>{office.name}</td>
                </tr>
                <tr>
                  <th className="w-[10rem]">Parent Office:</th>
                  <td>{office.parent?.name}</td>
                </tr>
                <tr>
                  <th>Email:</th>
                  <td>
                    {/* {emails.map((email, index) => (
                      <span key={index}>
                        {email.email}
                        {index + 1 !== emails.length ? ", " : ""}
                      </span>
                    ))} */}
                    {office.email}
                  </td>
                </tr>
                <tr>
                  <th>Phone Number(s):</th>
                  <td>
                    {/* {phoneNumbers.map((phoneNumber, index) => (
                      <span key={index}>
                        {phoneNumber.number}
                        {index + 1 !== phoneNumbers.length ? ", " : ""}
                      </span>
                    ))} */}
                    {office.phoneNumber}
                  </td>
                </tr>

                <tr>
                  <th>Opening Date:</th>
                  <td>{formattedDate(office.openingDate)}</td>
                </tr>
              </table>
            </div>
          </>
        ) : (
          <AccessDenied />
        )}
      </>
    );
  }

  return null;
}
