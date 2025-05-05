"use client";
import { useGetById } from "@/api";
import RecordActions from "@/components/record-actions";
import { Guarantor } from "@/types";
import { Skeleton, Typography } from "antd";
import _ from "lodash";
import { useParams } from "next/navigation";
import { useState } from "react";
import GuarantorForm from "../guarantor.form";
import { hasPermission } from "@/utils/permissions";
import { useRoles } from "@/providers/RolesProvider";
import Alert_ from "@/components/alert";

const { Title } = Typography;

const updatePermissions = ["UPDATE_GUARANTOR", "ALL_FUNCTIONS"];
const readPermissions = [
  "READ_GUARANTOR",
  "ALL_FUNCTIONS",
  "ALL_FUNCTIONS_READ",
];
const deletePermissions = ["DELETE_GUARANTOR", "ALL_FUNCTIONS"];
export default function Page() {
  const { tenantId, id, loanId, guarantorId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    permissions,
    error: permissionsError,
    isPermissionsLoading,
  } = useRoles();

  const canUpdate = hasPermission(permissions, updatePermissions);
  const canRead = hasPermission(permissions, readPermissions);
  const canDelete = hasPermission(permissions, deletePermissions);

  const {
    status: guarantorStatus,
    data: guarantor,
    error: guarantorError,
  } = useGetById<Guarantor>(
    `${tenantId}/loans/${loanId}/guarantors/`,
    `${guarantorId}`
  );

  if (guarantorStatus === "pending" || isPermissionsLoading) {
    return <Skeleton />;
  }

  if (guarantorError)
    return <Alert_ message="Error" description={guarantorError} type="error" />;

  if (permissionsError)
    return (
      <Alert_ message="Error" description={permissionsError} type="error" />
    );

  return (
    <>
      <div className="flex justify-between">
        <Title level={4}>Guarantor</Title>
        <RecordActions
          actionTitle="guarantor"
          isModalOpen={isModalOpen}
          redirectUrl={`/${tenantId}/clients/${id}/loan-accounts/${loanId}`}
          setIsModalOpen={setIsModalOpen}
          canUpdate={canUpdate}
          canDelete={canDelete}
          id={Number(guarantorId)}
          deleteUrl={`${tenantId}/guarantors`}
          updateForm={
            <GuarantorForm
              guarantor={guarantor}
              submitType="update"
              setIsModalOpen={setIsModalOpen}
            />
          }
        />
      </div>

      <div className=" w-full">
        <table className="text-md text-left w-full capitalize">
          <tr className="text-lg">
            <th className="w-[10rem]">Name:</th>
            <td>
              {guarantor?.client
                ? `${guarantor.client.firstName} ${
                    guarantor.client.middleName || ""
                  } ${guarantor.client.lastName}`
                : `${guarantor?.firstName} ${guarantor?.middleName || ""} ${
                    guarantor?.lastName
                  }`}
            </td>
          </tr>
          <tr>
            <th>Relationship:</th>
            <td>{guarantor?.relationship?.codeValue}</td>
          </tr>
          <tr>
            <th>Guarantor Type:</th>
            <td>{_.toLower(guarantor?.typeEnum)}</td>
          </tr>
          <tr>
            <th>Status:</th>
            <td>{guarantor?.isActive ? "Active" : "Inactive"}</td>
          </tr>
        </table>
      </div>
    </>
  );
}
