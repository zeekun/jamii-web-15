"use client";
import React, { useState, useRef } from "react";
import { Menu, MenuProps, Tabs, Skeleton } from "antd";
import { useCreateV3, useGetById, usePatchV2 } from "@/api";
import { Client } from "@/types";
import General from "./general";
import {
  CheckCircleOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  MenuOutlined,
  MoneyCollectOutlined,
  OrderedListOutlined,
  PlusCircleOutlined,
  UndoOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import Alert_ from "@/components/alert";
import toast from "@/utils/toast";
import LoanCreateModal from "./components/loans/create.modal";
import SavingsCreateModal from "./components/savings/create.modal";
import CreateModal from "@/components/create.modal";
import CreateClientForm from "../create.form";
import {
  assignStaffClientPermissions,
  closeClientPermissions,
  MODAL_WIDTH,
  proposeAndAcceptTransferClientPermissions,
  proposeTransferClientPermissions,
  readClientPermissions,
  unassignStaffClientPermissions,
  updateClientPermissions,
} from "../constants";
import ActivateForm from "./activate.form";
import RejectForm from "./reject.form";
import WithdrawForm from "./withdraw.form";
import CloseForm from "./close.form";
import DeleteForm from "./delete.form";
import AssignStaffForm from "./assign-staff.form";
import TransferClientForm from "./transfer-client.form";
import ShareCreateModal from "./components/shares/create.modal";
import FixedDepositCreateModal from "./fixed-deposits/create.modal";
import FamilyMembersDataTable from "./family-members.data-table";
import IdentitiesDataTable from "./identities.data-table";
import { useParams } from "next/navigation";
import StandingInstructionsDataTable from "./standing-instructions/standing-instructions.data-table";
import { useRoles } from "@/providers/RolesProvider";
import { hasPermission } from "@/utils/permissions";
import SingleClientBody from "../components/single-client-body";
import SingleClientHeader from "../components/single-client-header";
import AccessDenied from "@/components/access-denied";
import { createLoanPermissions } from "./loan-accounts/constants";
import { createSavingsAccountPermissions } from "./savings-accounts/constants";
import { createShareAccountPermissions } from "./share-accounts/constants";
import { createFixedDepositAccountPermissions } from "./fixed-deposits/constants";

type MenuItem = Required<MenuProps>["items"][number];

export default function Page() {
  const { tenantId, id } = useParams();
  const [isActivateModalOpen, setIsActivateModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAssignStaffModalOpen, setIsAssignStaffModalOpen] = useState(false);
  const [isCreateSavingsModalOpen, setIsCreateSavingsModalOpen] =
    useState(false);
  const [isCreateFixedDepositModalOpen, setIsCreateFixedDepositModalOpen] =
    useState(false);
  const [isCreateShareModalOpen, setIsCreateShareModalOpen] = useState(false);
  const [isUpdateClientModalOpen, setIsUpdateClientModalOpen] = useState(false);
  const [isTransferClientModalOpen, setIsTransferClientModalOpen] =
    useState(false);
  const [isModal1Visible, setIsModal1Visible] = useState(false);
  const [isModal2Visible, setIsModal2Visible] = useState(false);

  const [clientId, setClientId] = useState(id);
  const [picture, setPicture] = useState<File | null>(null);

  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const {
    permissions,
    error: permissionsError,
    isPermissionsLoading,
  } = useRoles();

  const canReadClient = hasPermission(permissions, readClientPermissions);
  const canUpdateClient = hasPermission(permissions, updateClientPermissions);
  const canCreateLoan = hasPermission(permissions, createLoanPermissions);
  const canCreateSavingsAccount = hasPermission(
    permissions,
    createSavingsAccountPermissions
  );
  const canCreateShareAccount = hasPermission(
    permissions,
    createShareAccountPermissions
  );
  const canCreateFixedDepositAccount = hasPermission(
    permissions,
    createFixedDepositAccountPermissions
  );
  const canCloseClient = hasPermission(permissions, closeClientPermissions);
  const canUnassignStaffClient = hasPermission(
    permissions,
    unassignStaffClientPermissions
  );
  const canAssignStaffClient = hasPermission(
    permissions,
    assignStaffClientPermissions
  );

  const canProposeTransferClient = hasPermission(
    permissions,
    proposeTransferClientPermissions
  );

  const canProposeAndAcceptTransferClientPermissions = hasPermission(
    permissions,
    proposeAndAcceptTransferClientPermissions
  );

  const {
    status: clientStatus,
    data: client,
    error: clientError,
  } = useGetById<Client>(`${tenantId}/clients`, Number(id));

  const { mutate: insertProfilePicture } = useCreateV3(`${tenantId}/files`, [
    `${tenantId}/clients`,
    `${id}`,
  ]);

  const { mutate: deleteProfilePicture } = usePatchV2(
    `${tenantId}/clients`,
    Number(id),
    [`${tenantId}/clients`, `${id}`]
  );

  const pages = [
    {
      label: "General",
      key: "General",
      children: <General client={client} />,
    },
    {
      label: "Family Members",
      key: "Family Members",
      children: <FamilyMembersDataTable />,
    },
    {
      label: "Identities",
      key: "Identities",
      children: <IdentitiesDataTable />,
    },
    {
      label: "Standing Instructions",
      key: "standing-instructions",
      children: client && <StandingInstructionsDataTable client={client} />,
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
          CreateForm={<ActivateForm client={client} />}
        />
      ),

      style: itemStyle,
    },
    {
      key: "Reject",
      label: (
        <CreateModal
          pageTitle={""}
          isModalOpen={isRejectModalOpen}
          setIsModalOpen={setIsRejectModalOpen}
          icon={
            client?.statusEnum === "REJECTED" ? (
              <UndoOutlined title={"Undo Rejection"} />
            ) : (
              <CloseOutlined title={"Reject"} />
            )
          }
          text={false}
          buttonTitle={
            client?.statusEnum === "REJECTED" ? "Undo Rejection" : "Reject"
          }
          submitType="update"
          iconOnly={false}
          buttonWidth
          CreateForm={
            <RejectForm
              setIsModalOpen={setIsRejectModalOpen}
              client={client}
              undoRejection={client?.statusEnum === "REJECTED" ? true : false}
            />
          }
        />
      ),
      style: itemStyle,
    },
    {
      key: "Withdraw",
      label: (
        <CreateModal
          pageTitle={""}
          isModalOpen={isWithdrawModalOpen}
          setIsModalOpen={setIsWithdrawModalOpen}
          icon={
            client?.statusEnum === "WITHDRAWN" ? (
              <UndoOutlined title={"Undo Withdrawal"} />
            ) : (
              <CloseOutlined title={"Withdraw"} />
            )
          }
          text={false}
          buttonTitle={
            client?.statusEnum === "WITHDRAWN" ? "Undo Withdrawal" : "Withdraw"
          }
          submitType="update"
          iconOnly={false}
          buttonWidth
          CreateForm={
            <WithdrawForm
              client={client}
              undoWithdraw={client?.statusEnum === "WITHDRAWN" ? true : false}
            />
          }
        />
      ),
      style: itemStyle,
    },
    {
      key: "closeClient",
      label: (
        <CreateModal
          pageTitle={""}
          isModalOpen={isCloseModalOpen}
          setIsModalOpen={setIsCloseModalOpen}
          icon={
            client?.statusEnum === "CLOSED" ? (
              <UndoOutlined title={"Undo Closure"} />
            ) : (
              <CloseOutlined title={"Close"} />
            )
          }
          text={false}
          buttonTitle={
            client?.statusEnum === "CLOSED" ? "Undo Closure" : "Close"
          }
          submitType="update"
          iconOnly={false}
          buttonWidth
          CreateForm={
            <CloseForm
              client={client}
              undoClosure={client?.statusEnum === "CLOSED" ? true : false}
            />
          }
        />
      ),
      style: itemStyle,
    },
    {
      key: "Delete",
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
          CreateForm={<DeleteForm client={client} />}
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
          icon={client?.staff ? <UserDeleteOutlined /> : <UserAddOutlined />}
          text={false}
          buttonTitle={client?.staff ? "Unassign Staff" : "Assign Staff"}
          submitType="update"
          iconOnly={false}
          buttonWidth
          CreateForm={
            <AssignStaffForm
              setIsModalOpen={setIsAssignStaffModalOpen}
              client={client as Client}
            />
          }
        />
      ),
      style: itemStyle,
    },
  ];

  let moreChildren = [
    { key: "Upload Signature", label: "Upload Signature", style: itemStyle },
    { key: "Delete Signature", label: "Delete Signature", style: itemStyle },
  ];

  if (client?.statusEnum === "REJECTED") {
    actionsChildren.splice(0, 1);
    actionsChildren.splice(1);
    moreChildren.splice(5);
  }

  if (client?.statusEnum === "WITHDRAWN") {
    actionsChildren.splice(0, 2);
    actionsChildren.splice(1);
    moreChildren.splice(5);
  }

  if (client?.statusEnum === "CLOSED") {
    actionsChildren.splice(0, 3);
    actionsChildren.splice(1);
    moreChildren.splice(5);
  }

  if (client?.statusEnum === "ACTIVE") {
    actionsChildren.splice(0, 3);
    actionsChildren.splice(1, 1);
    actionsChildren.push({
      key: "transferClient",
      label: (
        <CreateModal
          pageTitle={""}
          isModalOpen={isTransferClientModalOpen}
          setIsModalOpen={setIsTransferClientModalOpen}
          icon={<UserSwitchOutlined />}
          text={false}
          buttonTitle={"Transfer Client"}
          submitType="update"
          iconOnly={false}
          buttonWidth
          CreateForm={<TransferClientForm client={client} />}
        />
      ),
      style: itemStyle,
    });
  }

  let applicationsChildren = [
    {
      key: "loanApplication",
      label: <LoanCreateModal submitType="create" client={client} />,
      style: { ...itemStyle, marginTop: "0.8rem" },
    },
    {
      key: "savingsAccountApplication",
      label: (
        <SavingsCreateModal
          setIsModalOpen={setIsCreateSavingsModalOpen}
          submitType="create"
          isModalOpen={isCreateSavingsModalOpen}
          client={client}
        />
      ),
      style: itemStyle,
    },
    {
      key: "shareAccountApplication",
      label: (
        <ShareCreateModal
          client={client}
          submitType="create"
          setIsModalOpen={setIsCreateShareModalOpen}
          isModalOpen={isCreateShareModalOpen}
        />
      ),
      style: itemStyle,
    },
    {
      key: "fixedDepositApplication",
      label: (
        <FixedDepositCreateModal
          submitType="create"
          setIsModalOpen={setIsCreateFixedDepositModalOpen}
          isModalOpen={isCreateFixedDepositModalOpen}
        />
      ),
      style: itemStyle,
    },
    // {
    //   key: "RecurringDepositCreateModal",
    //   label: (
    //     <FixedDepositCreateModal
    //       submitType="create"
    //       depositType="RECURRING DEPOSIT"
    //       setIsModalOpen={setIsCreateFixedDepositModalOpen}
    //       isModalOpen={isCreateFixedDepositModalOpen}
    //     />
    //   ),
    //   style: itemStyle,
    // },
  ];

  /********* handle applications permissions ***********/
  applicationsChildren = applicationsChildren.filter((item) => {
    if (item.key === "loanApplication") {
      return canCreateLoan;
    }
    if (item.key === "savingsAccountApplication") {
      return canCreateSavingsAccount;
    }
    if (item.key === "shareAccountApplication") {
      return canCreateShareAccount;
    }
    if (item.key === "fixedDepositApplication") {
      return canCreateFixedDepositAccount;
    }
    return true; // Keep all other actions
  });

  /********* handle actions permissions ***********/
  actionsChildren = actionsChildren.filter((item) => {
    if (item.key === "closeClient") {
      return canCloseClient;
    }

    if (item.key === "assignStaff") {
      if (client?.staff) {
        // Show "Unassign Staff" only if user has unassign permissions
        return canUnassignStaffClient;
      } else {
        // Show "Assign Staff" only if user has assign permissions
        return canAssignStaffClient;
      }
    }

    if (item.key === "transferClient") {
      return (
        canProposeTransferClient || canProposeAndAcceptTransferClientPermissions
      );
    }

    return true; // Keep all other actions
  });

  const items: MenuItem[] = [
    {
      key: "updateClient",
      label: (
        <CreateModal
          isModalOpen={isUpdateClientModalOpen}
          setIsModalOpen={setIsUpdateClientModalOpen}
          className="text-left w-full"
          submitType="update"
          buttonType="green"
          icon={<EditOutlined />}
          pageTitle="Client"
          CreateForm={
            <CreateClientForm
              setIsModalOpen={setIsUpdateClientModalOpen}
              submitType="update"
              id={client?.id}
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

    {
      key: "More",
      label: "More",
      icon: <PlusCircleOutlined />,
      children: moreChildren,
      style: itemStyle,
    },
  ];

  if (
    client?.statusEnum === "REJECTED" ||
    client?.statusEnum === "WITHDRAWN" ||
    client?.statusEnum === "CLOSED" ||
    client?.statusEnum === "PENDING"
  ) {
    items.splice(0, 2);
    items.splice(1, 1);
  }

  if (client?.statusEnum === "PENDING") {
    items.splice(1, 1);
  }

  const handleIconClick = () => {
    setShowMenu((prevState) => !prevState);
  };

  if (clientStatus === "pending") {
    return <Skeleton />;
  }

  if (clientStatus === "error") {
    return (
      <Alert_
        message={"Error"}
        description={clientError.message}
        type={"error"}
      />
    );
  }

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!picture) {
      alert("Please provide picture!");
      return;
    }

    const formData = new FormData();
    formData.append("clientId", String(clientId));
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
        client: {
          imageId: null,
          legalFormEnum: client?.legalFormEnum,
          officeId: client?.officeId,
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
  };

  const showModal2 = () => {
    setIsModal2Visible(true);
  };

  const handleOk1 = () => {
    setIsModal1Visible(false);
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

  /************************** */

  // Filter the items array to exclude "updateClient" if no permission
  const filteredItems = !canUpdateClient
    ? items.filter((item) => item?.key !== "updateClient")
    : items;

  if (isPermissionsLoading) {
    return <Skeleton />;
  }

  if (permissionsError)
    return (
      <Alert_ message="Error" description={permissionsError} type="error" />
    );

  let borderColor;
  switch (client.statusEnum) {
    case "PENDING":
      borderColor = "border-orange-500";
      break;
    case "ACTIVE":
      borderColor = "border-green-600";
      break;
    case "REJECTED":
    case "WITHDRAWN":
    case "CLOSED":
      borderColor = "border-gray-500";
      break;
    default:
      borderColor = "border-red-500";
  }

  if (clientStatus === "success" && client) {
    return (
      <>
        {" "}
        {canReadClient ? (
          <>
            <div
              className={`bg-slate-200 border-l-8 ${borderColor} shadow-lg rounded-xl px-6 py-4 mb-6 relative`}
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-6">
                  <SingleClientHeader
                    client={client}
                    showModal1={showModal1}
                    showModal2={showModal2}
                    isModal1Visible={isModal1Visible}
                    handleOk1={handleOk1}
                    handleCancel1={handleCancel1}
                    isModal2Visible={isModal2Visible}
                    handleOk2={handleOk2}
                    handleCancel2={handleCancel2}
                    handleSubmit={handleSubmit}
                    clientId={clientId}
                    setClientId={setClientId}
                    handleFileChange={handleFileChange}
                    onDelete={onDelete}
                    id={id}
                    permissions={permissions}
                  />
                  <SingleClientBody client={client} />
                </div>

                <MenuOutlined
                  className="absolute top-4 right-4 text-xl text-gray-700 hover:text-black cursor-pointer"
                  onClick={handleIconClick}
                />

                {showMenu && (
                  <div
                    ref={menuRef}
                    className="absolute top-[3rem] right-4 bg-white rounded-lg shadow-xl z-30"
                  >
                    <Menu
                      mode="vertical"
                      className="rounded-lg"
                      items={filteredItems}
                    />
                  </div>
                )}
              </div>
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
