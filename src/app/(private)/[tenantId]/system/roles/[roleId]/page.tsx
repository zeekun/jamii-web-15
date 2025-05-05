"use client";
import { useCreate, useDelete, useGet, useGetById, usePatch } from "@/api";
import { useParams, useRouter } from "next/navigation";
import { Permission, Role, RolePermission } from "@/types";
import { useState, useEffect } from "react";
import { Checkbox, Button, Input, Popconfirm, Skeleton } from "antd";
import Link from "next/link";
import classNames from "classnames";
import { Typography } from "antd";
import Loading from "@/components/loading";
import Alert_ from "@/components/alert";
import MyButton from "@/components/my-button";
import toast from "@/utils/toast";
import {
  DeleteOutlined,
  EditOutlined,
  LockOutlined,
  MinusOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import CreateModal from "@/components/create.modal";
import CreateForm from "../create.form";
import { useRoles } from "@/providers/RolesProvider";
import { hasPermission } from "@/utils/permissions";
import { readRolePermissions, updateRolePermissions } from "../constants";
const { Title } = Typography;

export default function Page() {
  const { tenantId, roleId } = useParams();
  const [submitLoader, setSubmitLoader] = useState(false);
  const [editClicked, setEditClicked] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [disableOpen, setDisableOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    status: roleStatus,
    data: role,
    error: roleError,
  } = useGetById<Role>(`${tenantId}/roles`, Number(roleId));

  const {
    permissions: userPermissions,
    error: permissionsError,
    isPermissionsLoading,
  } = useRoles();

  const canUpdateRole = hasPermission(userPermissions, updateRolePermissions);
  const canRead = hasPermission(userPermissions, readRolePermissions);

  const {
    status: permissionsStatus,
    data: permissions,
    error,
  } = useGet<Permission[]>(`${tenantId}/permissions`, [
    `${tenantId}/permissions`,
  ]);

  const {
    status: rolePermissionsStatus,
    data: rolePermissions,
    error: rolePermissionsError,
  } = useGet<RolePermission[]>(`${tenantId}/roles/${roleId}/permissions`, [
    `${tenantId}/roles/${roleId}/permissions`,
  ]);

  const { mutate: updatePermissions } = useCreate(
    `${tenantId}/roles/${roleId}/permissions`,
    [`${tenantId}/roles/${roleId}/permissions`]
  );

  const [groupedPermissions, setGroupedPermissions] = useState<{
    [key: string]: Permission[];
  }>({});
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  // State to track selected permissions
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<
    Set<number>
  >(new Set());

  // Populate selectedPermissionIds when rolePermissions are fetched
  useEffect(() => {
    if (rolePermissionsStatus === "success" && rolePermissions) {
      setSelectedPermissionIds(
        new Set(rolePermissions.map((rp) => Number(rp.permissionId)))
      );
    }
  }, [rolePermissionsStatus, rolePermissions]);

  // Group permissions by 'grouping'
  useEffect(() => {
    if (permissionsStatus === "success" && permissions) {
      const grouped = permissions.reduce<{ [key: string]: Permission[] }>(
        (acc, permission) => {
          if (!acc[permission.grouping]) {
            acc[permission.grouping] = [];
          }
          acc[permission.grouping].push(permission);
          return acc;
        },
        {}
      );
      setGroupedPermissions(grouped);
      if (!selectedGroup && Object.keys(grouped).length > 0) {
        setSelectedGroup(Object.keys(grouped)[0]);
      }
    }
  }, [permissionsStatus, permissions, selectedGroup]);

  // Log selectedPermissionIds whenever it changes
  useEffect(() => {
    console.log(selectedPermissionIds);
    console.log("Checked IDs:", Array.from(selectedPermissionIds));
  }, [selectedPermissionIds]);

  // Toggle permission selection
  const togglePermission = (permissionId: number) => {
    setSelectedPermissionIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(permissionId)) {
        newSet.delete(permissionId);
      } else {
        newSet.add(permissionId);
      }
      return newSet;
    });
  };

  // Select all permissions in the current group
  const selectAll = () => {
    if (selectedGroup && groupedPermissions[selectedGroup]) {
      setSelectedPermissionIds((prev) => {
        const newSet = new Set(prev);
        groupedPermissions[selectedGroup].forEach((permission) => {
          newSet.add(Number(permission.id));
        });
        return newSet;
      });
    }
  };

  // Deselect all permissions in the current group
  const deselectAll = () => {
    if (selectedGroup && groupedPermissions[selectedGroup]) {
      setSelectedPermissionIds((prev) => {
        const newSet = new Set(prev);
        groupedPermissions[selectedGroup].forEach((permission) => {
          newSet.delete(Number(permission.id));
        });
        return newSet;
      });
    }
  };

  const handleSubmit = () => {
    updatePermissions(
      { permissions: Array.from(selectedPermissionIds) },
      {
        onSuccess: () => {
          setSubmitLoader(false);
          toast({
            type: "success",
            response: `Permissions updated successfully.`,
          });
        },
        onError(error, variables, context) {
          toast({ type: "error", response: error });
          setSubmitLoader(false);
        },
      }
    );
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const { mutate: deleteRole } = useDelete(`${tenantId}/roles`);
  const { mutate: updateRole } = usePatch(`${tenantId}/roles`, Number(roleId));

  const handleDisableOk = () => {
    setConfirmLoading(true);

    updateRole(
      { isDisabled: !role?.isDisabled },
      {
        onSuccess: () => {
          setDeleteOpen(false);
          setConfirmLoading(false);
          toast({
            type: "success",
            response: `Role ${
              !role?.isDisabled ? "disabled" : "un-disabled"
            } successfully.`,
          });

          if (role?.isDisabled) router.push(`/${tenantId}/system/roles`);
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

  const handleDeleteOk = () => {
    setConfirmLoading(true);

    deleteRole(Number(roleId), {
      onSuccess: () => {
        setDeleteOpen(false);
        setConfirmLoading(false);
        toast({
          type: "success",
          response: `Role deleted successfully.`,
        });
        router.push(`/${tenantId}/system/roles`);
      },
      onError(error, variables, context) {
        setConfirmLoading(false);
        toast({
          type: "error",
          response: error,
        });
      },
    });
  };

  if (roleStatus === "pending") {
    return <Skeleton />;
  }

  return (
    <>
      {roleStatus === "error" ? (
        <Alert_ message={"Error"} description={roleError} type={"error"} />
      ) : (
        <>
          <Title level={4} className="capitalize">
            Role: {role.name}
          </Title>
          {role.description}
          <div className="flex">
            <div className="w-1/4 border-r border-gray-300 p-4 pl-0">
              <Title level={5} className="capitalize">
                Permissions: {selectedGroup}
              </Title>
              <div className="flex flex-col space-y-2">
                {Object.keys(groupedPermissions)
                  .sort((a, b) => a.localeCompare(b))
                  .map((groupKey) => (
                    <Link
                      key={groupKey}
                      href="#"
                      className={classNames(
                        "px-4 py-2 block cursor-pointer rounded-md capitalize",
                        {
                          "bg-blue-500 hover:text-white text-white":
                            selectedGroup === groupKey,
                          "bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-black":
                            selectedGroup !== groupKey,
                        }
                      )}
                      onClick={() => setSelectedGroup(groupKey)}
                    >
                      {groupKey}
                    </Link>
                  ))}
              </div>
            </div>

            <div className="w-3/4 p-4">
              {selectedGroup && (
                <div>
                  <div className="flex justify-end mb-4 space-x-2 mt-[-4rem]">
                    {!role.isDisabled ? (
                      <>
                        <MyButton
                          type={!editClicked ? "green" : "default"}
                          onClick={() => setEditClicked(!editClicked)}
                          icon={<EditOutlined />}
                        >
                          {!editClicked ? "Edit Permissions" : "Cancel"}
                        </MyButton>

                        {canUpdateRole && (
                          <CreateModal
                            isModalOpen={isModalOpen}
                            setIsModalOpen={setIsModalOpen}
                            pageTitle={"Role"}
                            submitType="update"
                            buttonTitle="Edit Role"
                            buttonType="green"
                            icon={<EditOutlined />}
                            CreateForm={
                              <CreateForm
                                submitType="update"
                                id={Number(roleId)}
                                setIsModalOpen={setIsModalOpen}
                                role={role}
                              />
                            }
                          />
                        )}

                        {editClicked && (
                          <>
                            <Button
                              type="primary"
                              icon={<PlusOutlined />}
                              onClick={selectAll}
                            >
                              Select All
                            </Button>
                            <MyButton
                              type="danger"
                              icon={<MinusOutlined />}
                              onClick={deselectAll}
                            >
                              Deselect All
                            </MyButton>
                          </>
                        )}
                      </>
                    ) : null}

                    {!editClicked && (
                      <>
                        <Popconfirm
                          title={`${
                            role.isDisabled ? "Un-Disable" : "Disable"
                          }`}
                          description={`Are you sure you want to  ${
                            role.isDisabled ? "Un-Disable" : "Disable"
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
                            {role.isDisabled ? "Un-Disable" : "Disable"}
                          </MyButton>
                        </Popconfirm>

                        {role.name !== "super" && (
                          <Popconfirm
                            title="Delete"
                            description="Are you sure you want to Delete?"
                            placement="bottomLeft"
                            open={deleteOpen}
                            onConfirm={handleDeleteOk}
                            okButtonProps={{ loading: confirmLoading }}
                            onCancel={() => {
                              setDeleteOpen(false);
                            }}
                          >
                            <MyButton
                              type="danger"
                              onClick={() => {
                                setDeleteOpen(true);
                              }}
                              icon={<DeleteOutlined />}
                            >
                              Delete
                            </MyButton>
                          </Popconfirm>
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex justify-start mb-4">
                    <Input
                      placeholder="Search permissions"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      style={{ width: 300 }}
                    />
                  </div>
                  <ul>
                    {groupedPermissions[selectedGroup]
                      .slice() // Create a copy of the array to avoid mutating the original
                      .filter(
                        (permission) =>
                          permission.entityName
                            ?.toLowerCase()
                            .includes(searchQuery) ||
                          permission.actionName
                            ?.toLowerCase()
                            .includes(searchQuery) ||
                          permission.code
                            ?.toLowerCase()
                            .replaceAll("_", " ")
                            .includes(searchQuery)
                      ) // Filter permissions based on the search query
                      .sort((a, b) => {
                        const entityComparison =
                          a.entityName?.localeCompare(b.entityName || "") || 0;
                        if (entityComparison !== 0) return entityComparison;
                        return (
                          a.actionName?.localeCompare(b.actionName || "") || 0
                        );
                      }) // Sort by entityName and then actionName
                      .map((permission, index) => (
                        <li key={index} className="mb-1">
                          <Checkbox
                            disabled={!editClicked}
                            checked={selectedPermissionIds.has(
                              Number(permission.id)
                            )}
                            onChange={() =>
                              togglePermission(Number(permission.id))
                            }
                          >
                            <span className={!editClicked ? "text-black" : ""}>
                              {permission.code.replaceAll("_", " ")}
                            </span>
                          </Checkbox>
                        </li>
                      ))}
                  </ul>

                  {editClicked && (
                    <div className="flex justify-start items-center gap-2 mt-5">
                      <Button
                        type={!editClicked ? "primary" : "default"}
                        onClick={() => setEditClicked(!editClicked)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="primary"
                        onClick={handleSubmit}
                        loading={submitLoader}
                      >
                        Submit
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
