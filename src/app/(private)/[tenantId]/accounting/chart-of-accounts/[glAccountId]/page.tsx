"use client";
import React, { useState } from "react";
import { useGetById, usePatchV2 } from "@/api";
import { GLAccount } from "@/types";
import Alert_ from "@/components/alert";
import "@/components/css/Table.css";
import { useParams, useRouter } from "next/navigation";
import CreateForm from "../create.form";
import AccessDenied from "@/components/access-denied";
import { Popconfirm, Skeleton, Typography } from "antd";
import { useRoles } from "@/providers/RolesProvider";
import { hasPermission } from "@/utils/permissions";
import RecordActions from "@/components/record-actions";
import MyButton from "@/components/my-button";
import { LockOutlined } from "@ant-design/icons";
import toast from "@/utils/toast";
import { CREATE_MODAL_WIDTH } from "../constants";
const { Title } = Typography;

const updatePermissions = ["UPDATE_GLACCOUNT", "ALL_FUNCTIONS"];
const deletePermissions = ["DELETE_GLACCOUNT", "ALL_FUNCTIONS"];
const readPermissions = [
  "READ_GLACCOUNT",
  "ALL_FUNCTIONS",
  "ALL_FUNCTIONS_READ",
];

export default function Page() {
  const { tenantId, glAccountId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [disableOpen, setDisableOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const router = useRouter();

  const {
    permissions,
    error: permissionsError,
    isPermissionsLoading,
  } = useRoles();

  const canUpdate = hasPermission(permissions, updatePermissions);
  const canRead = hasPermission(permissions, readPermissions);
  const canDelete = hasPermission(permissions, deletePermissions);

  const {
    status: glAccountStatus,
    data: account,
    error: accountError,
  } = useGetById<GLAccount>(`${tenantId}/gl-accounts`, `${glAccountId}`);

  const { mutate: updateAccount } = usePatchV2(
    `${tenantId}/gl-accounts`,
    Number(glAccountId)
  );

  if (glAccountStatus === "error") {
    return (
      <Alert_
        message={"Error"}
        description={accountError.message}
        type={"error"}
      />
    );
  }

  if (glAccountStatus === "pending" || isPermissionsLoading) {
    return <Skeleton />;
  }

  if (permissionsError)
    return (
      <Alert_ message="Error" description={permissionsError} type="error" />
    );

  const handleDisableOk = () => {
    setConfirmLoading(true);

    updateAccount(
      { isActive: !account?.isActive, parentId: account.parentId || 0 },
      {
        onSuccess: () => {
          setDeleteOpen(false);
          setConfirmLoading(false);
          toast({
            type: "success",
            response: `Account ${
              account?.isActive ? "disabled" : "un-disabled"
            } successfully.`,
          });

          if (account?.isActive)
            router.push(`/${tenantId}/accounting/chart-of-accounts`);
        },
        onError(error, variables, context) {
          setConfirmLoading(false);
          toast({
            type: "error",
            response: error,
          });
        },
      }
    );
  };

  if (glAccountStatus === "success" && account) {
    return (
      <>
        {canRead ? (
          <>
            <div className="flex justify-between">
              <Title level={4}>Account</Title>
              <div className={"flex justify-end gap-2"}>
                {canUpdate && (
                  <Popconfirm
                    title={`${!account.isActive ? "Un-Disable" : "Disable"}`}
                    description={`Are you sure you want to  ${
                      !account.isActive ? "Un-Disable" : "Disable"
                    }?`}
                    placement="bottomLeft"
                    open={disableOpen}
                    onConfirm={handleDisableOk}
                    okButtonProps={{ loading: confirmLoading }}
                    onCancel={() => {
                      setDisableOpen(false);
                    }}
                  >
                    <MyButton
                      type={"gray"}
                      onClick={() => {
                        setDisableOpen(true);
                      }}
                      icon={<LockOutlined />}
                    >
                      {!account.isActive ? "Un-Disable" : "Disable"}
                    </MyButton>
                  </Popconfirm>
                )}

                <RecordActions
                  actionTitle="account"
                  isModalOpen={isModalOpen}
                  redirectUrl={`/${tenantId}/accounting/chart-of-accounts`}
                  setIsModalOpen={setIsModalOpen}
                  canUpdate={canUpdate}
                  canDelete={canDelete}
                  id={Number(glAccountId)}
                  deleteUrl={`${tenantId}/gl-accounts`}
                  modalWidth={CREATE_MODAL_WIDTH}
                  updateForm={
                    <CreateForm
                      id={Number(glAccountId)}
                      submitType="update"
                      setIsModalOpen={setIsModalOpen}
                    />
                  }
                />
              </div>
            </div>

            <div className=" w-full">
              <table className="text-md text-left w-full">
                <tr className="text-lg">
                  <th className="w-[15rem]">Name:</th>
                  <td>{account.name}</td>
                </tr>
                <tr>
                  <th>GL Code:</th>
                  <td>{account.glCode}</td>
                </tr>
                <tr>
                  <th>Parent Account:</th>
                  <td>{account.parent?.name}</td>
                </tr>
                <tr>
                  <th>Type:</th>
                  <td>{account.type.codeValue}</td>
                </tr>
                <tr>
                  <th>Account Usage:</th>
                  <td>{account.usage.codeValue}</td>
                </tr>
                <tr>
                  <th>Manual Entries Allowed:</th>
                  <td>{account.manualEntriesAllowed ? "Yes" : "No"}</td>
                </tr>
                <tr>
                  <th>Description:</th>
                  <td>{account.description}</td>
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
