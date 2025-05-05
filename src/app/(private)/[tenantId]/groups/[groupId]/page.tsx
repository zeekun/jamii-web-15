"use client";
import React, { useState, useRef } from "react";
import { Menu, MenuProps, Tabs, Skeleton } from "antd";
import { useGetById } from "@/api";
import { Group } from "@/types";
import {
  CheckCircleOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  MenuOutlined,
  MoneyCollectOutlined,
  OrderedListOutlined,
  UndoOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
} from "@ant-design/icons";
import Alert_ from "@/components/alert";
import CreateModal from "@/components/create.modal";
import {
  assignStaffGroupPermissions,
  closeGroupPermissions,
  deleteGroupPermissions,
  MODAL_WIDTH,
  readGroupPermissions,
  unassignStaffGroupPermissions,
  updateGroupPermissions,
} from "../constants";
import { useParams } from "next/navigation";
import { useRoles } from "@/providers/RolesProvider";
import { hasPermission } from "@/utils/permissions";
import General from "./general";
import LoanCreateModal from "../../clients/[id]/components/loans/create.modal";
import SavingsCreateModal from "../../clients/[id]/components/savings/create.modal";
import ActivateForm from "./activate.form";
import CloseForm from "./close.form";
import DeleteForm from "./delete.form";
import SingleClientBody from "./single-client-body";
import CreateForm from "../create.form";
import GroupRolesDataTable from "./group-roles.data-table";
import AssignStaffForm from "../../clients/[id]/assign-staff.form";
import AccessDenied from "@/components/access-denied";
import { createLoanPermissions } from "../../clients/[id]/loan-accounts/constants";
import { createSavingsAccountPermissions } from "../../clients/[id]/savings-accounts/constants";
import ShareCreateModal from "../../clients/[id]/components/shares/create.modal";

type MenuItem = Required<MenuProps>["items"][number];

export default function Page() {
  const { tenantId, groupId } = useParams();
  const [isActivateModalOpen, setIsActivateModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAssignStaffModalOpen, setIsAssignStaffModalOpen] = useState(false);
  const [isCreateSavingsModalOpen, setIsCreateSavingsModalOpen] =
    useState(false);
  const [isCreateShareModalOpen, setIsCreateShareModalOpen] = useState(false);
  const [isUpdateClientModalOpen, setIsUpdateClientModalOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const {
    permissions,
    error: permissionsError,
    isPermissionsLoading,
  } = useRoles();

  const canReadGroup = hasPermission(permissions, readGroupPermissions);
  const canUpdateGroup = hasPermission(permissions, updateGroupPermissions);
  const canUnassignStaffGroup = hasPermission(
    permissions,
    unassignStaffGroupPermissions
  );
  const canAssignStaffGroup = hasPermission(
    permissions,
    assignStaffGroupPermissions
  );
  const canCloseGroup = hasPermission(permissions, closeGroupPermissions);
  const canDeleteGroup = hasPermission(permissions, deleteGroupPermissions);
  const canCreateLoan = hasPermission(permissions, createLoanPermissions);
  const canCreateSavingsAccount = hasPermission(
    permissions,
    createSavingsAccountPermissions
  );

  const {
    status: groupStatus,
    data: group,
    error: groupError,
  } = useGetById<Group>(`${tenantId}/groups`, Number(groupId));

  const pages = [
    {
      label: "General",
      key: "General",
      children: <General group={group} />,
    },
    {
      label: "Committee",
      key: "committee",
      children: <GroupRolesDataTable />,
    },
  ];

  const itemStyle = { backgroundColor: `#fff` };

  let actionsChildren = [
    {
      key: "activate",
      label: (
        <CreateModal
          pageTitle={""}
          isModalOpen={isActivateModalOpen}
          setIsModalOpen={setIsActivateModalOpen}
          icon={<CheckCircleOutlined title={"Activate"} />}
          text={false}
          buttonTitle={"Activate"}
          submitType="update"
          iconOnly={false}
          buttonWidth
          CreateForm={<ActivateForm group={group} />}
        />
      ),

      style: itemStyle,
    },
    {
      key: "closeGroup",
      label: (
        <CreateModal
          pageTitle={""}
          isModalOpen={isCloseModalOpen}
          setIsModalOpen={setIsCloseModalOpen}
          icon={
            group?.statusEnum === "CLOSED" ? (
              <UndoOutlined title={"Undo Closure"} />
            ) : (
              <CloseOutlined title={"Close"} />
            )
          }
          text={false}
          buttonTitle={
            group?.statusEnum === "CLOSED" ? "Undo Closure" : "Close"
          }
          submitType="update"
          iconOnly={false}
          buttonWidth
          CreateForm={
            <CloseForm
              group={group}
              undoClosure={group?.statusEnum === "CLOSED" ? true : false}
            />
          }
        />
      ),
      style: itemStyle,
    },
    {
      key: "deleteGroup",
      label: (
        <CreateModal
          pageTitle={""}
          isModalOpen={isDeleteModalOpen}
          setIsModalOpen={setIsDeleteModalOpen}
          icon={<DeleteOutlined title={"Delete"} />}
          text={false}
          buttonTitle={"Delete"}
          submitType="update"
          iconOnly={false}
          buttonWidth
          CreateForm={<DeleteForm group={group} />}
        />
      ),
      style: itemStyle,
    },
    {
      key: "assignStaff",
      label: (
        <CreateModal
          pageTitle={""}
          isModalOpen={isAssignStaffModalOpen}
          setIsModalOpen={setIsAssignStaffModalOpen}
          icon={group?.staff ? <UserDeleteOutlined /> : <UserAddOutlined />}
          text={false}
          buttonTitle={group?.staff ? "Unassign Staff" : "Assign Staff"}
          submitType="update"
          iconOnly={false}
          buttonWidth
          CreateForm={
            <AssignStaffForm
              setIsModalOpen={setIsAssignStaffModalOpen}
              client={group as Group}
              type="group"
            />
          }
        />
      ),
      style: itemStyle,
    },
  ];

  if (group?.statusEnum === "ACTIVE") {
    actionsChildren.splice(0, 1);
  }

  if (group?.statusEnum === "REJECTED") {
    actionsChildren.splice(0, 1);
    actionsChildren.splice(1);
  }

  if (group?.statusEnum === "WITHDRAWN") {
    actionsChildren.splice(0, 2);
    actionsChildren.splice(1);
  }

  if (group?.statusEnum === "CLOSED") {
    actionsChildren.splice(0, 3);
    actionsChildren.splice(1);
  }

  /********* handle actions permissions ***********/

  actionsChildren = actionsChildren.filter((item) => {
    if (item.key === "assignStaff") {
      if (group?.staff) {
        // Show "Unassign Staff" only if user has unassign permissions
        return canUnassignStaffGroup;
      } else {
        // Show "Assign Staff" only if user has assign permissions
        return canAssignStaffGroup;
      }
    }

    if (item.key === "closeGroup") {
      return canCloseGroup;
    }

    if (item.key === "deleteGroup") {
      return canDeleteGroup;
    }
    return true; // Keep all other actions
  });

  let applicationsChildren = [
    {
      key: "loanApplication",
      label: <LoanCreateModal submitType="create" client={group} />,
      style: { ...itemStyle, marginTop: "0.8rem" },
    },
    {
      key: "savingsAccountApplication",
      label: (
        <SavingsCreateModal
          setIsModalOpen={setIsCreateSavingsModalOpen}
          submitType="create"
          isModalOpen={isCreateSavingsModalOpen}
          client={group}
        />
      ),
      style: itemStyle,
    },
    {
      key: "shareAccountApplication",
      label: (
        <ShareCreateModal
          setIsModalOpen={setIsCreateShareModalOpen}
          submitType="create"
          isModalOpen={isCreateShareModalOpen}
          client={group}
        />
      ),
      style: itemStyle,
    },
  ];

  /********* handle applications permissions ***********/
  applicationsChildren = applicationsChildren.filter((item) => {
    if (item.key === "loanApplication") {
      return canCreateLoan;
    }
    if (item.key === "savingsAccountApplication") {
      return canCreateSavingsAccount;
    }
    return true; // Keep all other actions
  });

  // Create the base items array
  const baseItems: MenuItem[] = [
    {
      key: "updateGroup",
      label: (
        <CreateModal
          isModalOpen={isUpdateClientModalOpen}
          setIsModalOpen={setIsUpdateClientModalOpen}
          className="text-left w-full"
          submitType="update"
          buttonType="green"
          icon={<EditOutlined />}
          pageTitle="Group"
          CreateForm={
            <CreateForm
              setIsModalOpen={setIsUpdateClientModalOpen}
              submitType="update"
              id={group?.id}
            />
          }
          width={MODAL_WIDTH}
        />
      ),
      style: itemStyle,
    },
    // Only include applications if there are children
    ...(applicationsChildren.length > 0
      ? [
          {
            key: "applications",
            icon: <MoneyCollectOutlined />,
            label: "Applications",
            children: applicationsChildren,
            style: itemStyle,
          },
        ]
      : []),

    ...(actionsChildren.length > 0
      ? [
          {
            key: "Actions",
            label: "Actions",
            icon: <OrderedListOutlined />,
            children: actionsChildren,
            style: itemStyle,
          },
        ]
      : []),
  ];

  // Final items array (with optional updateGroup removal if needed)
  const items = !canUpdateGroup
    ? baseItems.filter((item) => item?.key !== "updateGroup")
    : baseItems;

  if (
    group?.statusEnum === "REJECTED" ||
    group?.statusEnum === "WITHDRAWN" ||
    group?.statusEnum === "CLOSED" ||
    group?.statusEnum === "PENDING"
  ) {
    items.splice(0, 2);
    items.splice(1, 1);
  }

  if (group?.statusEnum === "PENDING") {
    items.splice(1, 1);
  }

  const handleIconClick = () => {
    setShowMenu((prevState) => !prevState);
  };

  if (groupStatus === "pending") {
    return <Skeleton />;
  }

  if (groupStatus === "error") {
    return (
      <Alert_
        message={"Error"}
        description={groupError.message}
        type={"error"}
      />
    );
  }

  /*************handle permissions************* */

  // Filter the items array to exclude "updateClient" if no permission
  const filteredItems = !canUpdateGroup
    ? items.filter((item) => item?.key !== "updateGroup")
    : items;

  if (isPermissionsLoading) {
    return <Skeleton />;
  }

  if (permissionsError)
    return (
      <Alert_ message="Error" description={permissionsError} type="error" />
    );

  if (groupStatus === "success" && group) {
    let borderColor;
    switch (group.statusEnum) {
      case "PENDING":
        borderColor = "border-orange-600";
        break;
      case "REJECTED":
      case "CLOSED":
      case "WITHDRAWN":
        borderColor = "border-gray-700";
        break;
      case "ACTIVE":
        borderColor = "border-green-600";
        break;
      default:
        borderColor = "border-red-500";
    }

    return (
      <>
        {canReadGroup ? (
          <>
            <div
              className={`flex justify-between items-center mb-3 bg-slate-200 border-l-8 ${borderColor} shadow-lg rounded-xl px-6 py-4 mb-6 relative`}
            >
              <div className="flex gap-3">
                <SingleClientBody group={group} />
              </div>
              {filteredItems.length > 0 && (
                <MenuOutlined
                  className="absolute top-4 right-4 text-2xl hover:cursor-pointer"
                  onClick={handleIconClick}
                />
              )}

              {showMenu && (
                <div
                  ref={menuRef}
                  className="absolute top-[3rem] rounded-lg right-4 z-20 shadow-lg"
                >
                  <Menu
                    mode="vertical"
                    className="rounded-lg "
                    items={filteredItems}
                  />
                </div>
              )}
            </div>
            <Tabs items={pages} />
          </>
        ) : (
          <AccessDenied />
        )}
      </>
    );
  }

  return null;
}
