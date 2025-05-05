"use client";
import React, { useState } from "react";
import { useGet } from "@/api";
import { UserTenant } from "@/types";
import Alert_ from "@/components/alert";
import "@/components/css/Table.css";
import { useParams } from "next/navigation";
import { formattedDate } from "@/utils/dates";
import CreateForm from "../create.form";
import { PAGE_URL } from "../constants";
import Link from "next/link";
import RecordActions from "@/components/record-actions";
import { Skeleton, Typography } from "antd";
import { hasPermission } from "@/utils/permissions";
import { useRoles } from "@/providers/RolesProvider";
import AccessDenied from "@/components/access-denied";
const { Title } = Typography;

const updatePermissions = ["UPDATE_USER", "ALL_FUNCTIONS"];
const readPermissions = ["READ_USER", "ALL_FUNCTIONS", "ALL_FUNCTIONS_READ"];
const deletePermissions = ["DELETE_USER", "ALL_FUNCTIONS"];

export default function Page() {
  const { tenantId, userId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    permissions,
    error: permissionsError,
    isPermissionsLoading,
  } = useRoles();

  const {
    status: userStatus,
    data: user,
    error: userError,
  } = useGet<UserTenant>(`${tenantId}/users/${userId}`, [
    `${tenantId}/users/${userId}`,
  ]);

  const canUpdate = hasPermission(permissions, updatePermissions);
  const canRead = hasPermission(permissions, readPermissions);
  const canDelete = hasPermission(permissions, deletePermissions);

  const {
    status: rolesStatus,
    data: roles,
    error: rolesError,
  } = useGet<string[]>(`${tenantId}/auth-policies/roles/user/${userId}`, [
    `${tenantId}/auth-policies/roles/user/${userId}`,
  ]);

  if (userStatus === "error") {
    return <Alert_ message={"Error"} description={userError} type={"error"} />;
  }

  if (user === null) {
    return (
      <Alert_ message={"Error"} description={"User not found"} type={"error"} />
    );
  }

  if (userStatus === "pending" || isPermissionsLoading) {
    return <Skeleton />;
  }

  if (userStatus === "success") {
    console.log(user);
  }

  if (permissionsError)
    return (
      <Alert_ message="Error" description={permissionsError} type="error" />
    );

  if (userStatus === "success" && user) {
    return (
      <>
        {canRead ? (
          <>
            <div className="flex justify-between">
              <Title level={4}>User</Title>
              <RecordActions
                actionTitle="user"
                isModalOpen={isModalOpen}
                redirectUrl={`/${tenantId}/${PAGE_URL}`}
                setIsModalOpen={setIsModalOpen}
                canUpdate={canUpdate}
                canDelete={canDelete}
                id={Number(userId)}
                deleteUrl={`${tenantId}/users`}
                queryKey={[`${tenantId}/users?filter={"order":["id DESC"]}`]}
                updateForm={
                  <CreateForm
                    setIsModalOpen={setIsModalOpen}
                    id={Number(userId)}
                    submitType="update"
                    userRoles={roles}
                  />
                }
              />
            </div>

            <div className=" w-full">
              <table className="text-md text-left w-full border-solid border-[1px] mt-3 border-gray-200">
                <tr className="text-lg">
                  <th className="w-[10rem]">Name:</th>
                  <td>
                    {`${user.user.person.firstName} ${
                      user.user.person.middleName || ""
                    } ${user.user.person.lastName}`}
                  </td>
                </tr>
                <tr>
                  <th>Username:</th>
                  <td>{user.user.username}</td>
                </tr>
                <tr>
                  <th>Office:</th>
                  <td>
                    {user?.user?.offices?.find(
                      (o) => o.tenantId === Number(tenantId)
                    )?.name || "Not linked"}
                  </td>
                </tr>
                <tr>
                  <th>Roles:</th>
                  <td className="capitalize">
                    {rolesStatus === "pending"
                      ? "Loading..."
                      : rolesStatus === "success" && Array.isArray(roles)
                      ? roles.map((role, index) => (
                          <span key={index}>
                            {role}
                            {index + 1 !== roles.length ? ", " : ""}
                          </span>
                        ))
                      : ""}
                  </td>
                </tr>
                <tr>
                  <th>Phone Number:</th>
                  <td>{user.user.phoneNumber || ""}</td>
                </tr>
                <tr>
                  <th>Email:</th>
                  <td>{user.user.email || ""}</td>
                </tr>

                <tr>
                  <th>Staff:</th>
                  <td>
                    <Link
                      href={`/${tenantId}/organisation/employees/${user.user.staffId}`}
                    >
                      {(() => {
                        const staffMember = user?.user?.staff?.find(
                          (staff) => staff.tenantId === Number(tenantId)
                        );

                        return staffMember ? (
                          <span className="underline">
                            {`${staffMember.firstName || ""} ${
                              staffMember.middleName || ""
                            } ${staffMember.lastName || ""}`}
                          </span>
                        ) : (
                          "Not linked"
                        );
                      })()}
                    </Link>
                  </td>
                </tr>

                <tr>
                  <th>Created On:</th>
                  <td>
                    {formattedDate(user.createdAt, "DD MMM YYYY HH:MM:ss A")}
                  </td>
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
