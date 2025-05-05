"use client";
import React, { useState, useRef } from "react";
import { Menu, MenuProps, Skeleton, Tabs } from "antd";
import { useGetById } from "@/api";
import { Client, DepositAccount, SavingsAccount } from "@/types";
import General from "./general";
import {
  ArrowDownOutlined,
  ArrowRightOutlined,
  ArrowUpOutlined,
  CheckOutlined,
  CloseOutlined,
  DoubleRightOutlined,
  EditOutlined,
  MenuOutlined,
  UndoOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
} from "@ant-design/icons";
import Alert_ from "@/components/alert";
import CreateModal from "@/components/create.modal";
import ApproveForm from "../../components/savings/approve.form";
import Transactions from "./transactions";
import { MODAL_WIDTH } from "../../components/savings/constants";
import ActivateForm from "../../components/savings/activate.form";
import { formatNumber } from "@/utils/numbers";
import TransactionForm from "../../components/savings/transaction.form";
import TransferForm from "../../components/savings/transfer.form";
import CreateSavingsForm from "../../components/savings/create-savings.form";
import CreateFixedDepositAccountForm from "../../fixed-deposits/create.form";
import AssignStaffForm from "../../assign-staff.form";
import { useParams } from "next/navigation";
import PostInterestForm from "../../components/savings/post-interest.form";
import Charges from "./charges";
import Link from "next/link";
import CloseForm from "../../components/savings/close.form";
import RejectForm from "../../components/savings/reject.form";
import WithdrawnByClientForm from "../../components/savings/withdrawn-by-client.form";

type MenuItem = Required<MenuProps>["items"][number];

export default function SavingAccountPage() {
  const { tenantId, id, savingId } = useParams();
  const [isModifyModalOpen, setIsModifyModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isWithdrawnByClientModalOpen, setIsWithdrawnByClientModalOpen] =
    useState(false);
  const [isFixedDepositModalOpen, setIsFixedDepositModalOpen] = useState(false);
  const [isUndoApprovalModalOpen, setIsUndoApprovalModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isActivateModalOpen, setIsActivateModalOpen] = useState(false);
  const [isPostInterestModalOpen, setIsPostInterestModalOpen] = useState(false);
  const [isTransferFundsModalOpen, setIsTransferFundsModalOpen] =
    useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const {
    status: savingStatus,
    data: saving,
    error: savingError,
  } = useGetById<SavingsAccount>(
    `${tenantId}/savings-accounts`,
    Number(savingId)
  );

  const pages = [
    {
      label: "General",
      key: "General",
      children: <General saving={saving as DepositAccount} />,
    },
    {
      label: "Transactions",
      key: "Transactions",
      children: <Transactions savingId={String(savingId)} />,
    },
    {
      label: "Charges",
      key: "charges",
      children: <Charges savingId={String(savingId)} />,
    },
  ];

  const itemStyle = { backgroundColor: "#ffff", padding: "0px" };

  let items: MenuItem[] = [
    {
      key: "1",
      label: (
        <CreateModal
          pageTitle={""}
          isModalOpen={isModifyModalOpen}
          setIsModalOpen={setIsModifyModalOpen}
          icon={<EditOutlined title={"Modify Application"} />}
          text={false}
          buttonTitle={"Modify Application"}
          submitType="update"
          iconOnly={false}
          buttonWidth
          width={MODAL_WIDTH}
          CreateForm={
            <CreateSavingsForm
              setIsModalOpen={setIsApproveModalOpen}
              savingsAccountId={saving?.id}
              submitType={"update"}
            />
          }
        />
      ),
      style: itemStyle,
    },
    {
      key: "2",
      label: (
        <CreateModal
          pageTitle={""}
          isModalOpen={isApproveModalOpen}
          setIsModalOpen={setIsApproveModalOpen}
          icon={<CheckOutlined title={"Approve"} />}
          text={false}
          buttonTitle={"Approve Application"}
          submitType="update"
          iconOnly={false}
          buttonWidth
          CreateForm={
            <ApproveForm
              id={saving?.id}
              setIsModalOpen={setIsApproveModalOpen}
              clientId={Number(id)}
              saving={saving}
              page="SAVING ACCOUNT"
            />
          }
        />
      ),
      style: itemStyle,
    },
    {
      key: "assign-staff",
      label: (
        <CreateModal
          pageTitle={""}
          isModalOpen={isAssignModalOpen}
          setIsModalOpen={setIsAssignModalOpen}
          icon={
            saving?.fieldOfficer ? <UserDeleteOutlined /> : <UserAddOutlined />
          }
          text={false}
          buttonTitle={saving?.fieldOfficer ? "Unassign Staff" : "Assign Staff"}
          submitType="update"
          iconOnly={false}
          buttonWidth
          CreateForm={
            <AssignStaffForm
              setIsModalOpen={setIsAssignModalOpen}
              saving={saving}
              client={saving?.client as Client}
            />
          }
        />
      ),
      style: itemStyle,
    },
    {
      key: "reject",
      label: (
        <CreateModal
          pageTitle={""}
          isModalOpen={isRejectModalOpen}
          setIsModalOpen={setIsRejectModalOpen}
          icon={<CloseOutlined title={"Reject"} />}
          text={false}
          buttonTitle={"Reject"}
          submitType="update"
          iconOnly={false}
          buttonWidth
          CreateForm={
            <RejectForm
              setIsModalOpen={setIsRejectModalOpen}
              savingId={String(savingId)}
            />
          }
        />
      ),

      style: itemStyle,
    },
    {
      key: "withdrawnByClient",
      label: (
        <CreateModal
          pageTitle={""}
          isModalOpen={isWithdrawnByClientModalOpen}
          setIsModalOpen={setIsWithdrawnByClientModalOpen}
          icon={<CloseOutlined title={"Withdrawn By Client"} />}
          text={false}
          buttonTitle={"Withdrawn By Client"}
          submitType="update"
          iconOnly={false}
          buttonWidth
          CreateForm={
            <WithdrawnByClientForm
              setIsModalOpen={setIsWithdrawnByClientModalOpen}
              savingId={String(savingId)}
            />
          }
        />
      ),

      style: itemStyle,
    },
  ];

  if (saving?.savingsProduct.depositTypeEnum === "FIXED DEPOSIT") {
    items.shift();

    items.unshift({
      key: "Create Fixed Deposit",
      label: (
        <CreateModal
          pageTitle={""}
          isModalOpen={isFixedDepositModalOpen}
          setIsModalOpen={setIsFixedDepositModalOpen}
          icon={<EditOutlined />}
          text={false}
          buttonTitle={"Update Fixed Deposit"}
          submitType="update"
          buttonType="green"
          iconOnly={false}
          buttonWidth
          width={MODAL_WIDTH}
          CreateForm={
            <CreateFixedDepositAccountForm
              setIsModalOpen={setIsFixedDepositModalOpen}
              fixedDepositAccountId={saving?.id}
              submitType={"update"}
            />
          }
        />
      ),
      style: itemStyle,
    });
  }

  if (saving) {
    if (saving.statusEnum === "APPROVED") {
      items.splice(0);

      items.push(
        {
          key: "UndoApproval",
          label: (
            <CreateModal
              pageTitle={""}
              isModalOpen={isUndoApprovalModalOpen}
              setIsModalOpen={setIsUndoApprovalModalOpen}
              icon={<UndoOutlined />}
              text={false}
              buttonTitle={"Undo Approval"}
              submitType="update"
              iconOnly={false}
              buttonWidth
              CreateForm={
                <ApproveForm
                  id={saving?.id}
                  setIsModalOpen={setIsUndoApprovalModalOpen}
                  clientId={saving?.clientId}
                  saving={saving}
                  undoApproval
                  page="SAVING ACCOUNT"
                />
              }
            />
          ),
          style: itemStyle,
        },
        {
          key: "Activate",
          label: (
            <CreateModal
              pageTitle={""}
              isModalOpen={isActivateModalOpen}
              setIsModalOpen={setIsActivateModalOpen}
              icon={<CheckOutlined />}
              text={false}
              buttonTitle={"Activate"}
              submitType="update"
              iconOnly={false}
              buttonWidth
              CreateForm={
                <ActivateForm
                  id={saving?.id}
                  setIsModalOpen={setIsActivateModalOpen}
                  clientId={saving?.clientId}
                  saving={saving}
                  page="SAVING ACCOUNT"
                />
              }
            />
          ),
          style: itemStyle,
        }
      );
    }

    if (saving.statusEnum === "ACTIVE") {
      items.splice(0, 2);
      items.splice(1, 2);

      items.push(
        {
          key: "PostInterestAsOn",
          label: (
            <CreateModal
              pageTitle={""}
              isModalOpen={isPostInterestModalOpen}
              setIsModalOpen={setIsPostInterestModalOpen}
              icon={<ArrowRightOutlined />}
              text={false}
              buttonTitle={"Post Interest As On"}
              submitType="update"
              iconOnly={false}
              buttonWidth
              CreateForm={
                <PostInterestForm
                  setIsModalOpen={setIsPostInterestModalOpen}
                  id={saving?.id}
                  clientId={saving?.clientId}
                  saving={saving as DepositAccount}
                  page="SAVING ACCOUNT"
                />
              }
            />
          ),
          style: itemStyle,
        },
        {
          key: "deposit",
          label: (
            <CreateModal
              pageTitle={""}
              isModalOpen={isDepositModalOpen}
              setIsModalOpen={setIsDepositModalOpen}
              icon={<ArrowUpOutlined />}
              text={false}
              buttonTitle={"Deposit"}
              submitType="update"
              iconOnly={false}
              buttonWidth
              CreateForm={
                <TransactionForm
                  saving={saving}
                  setIsModalOpen={setIsDepositModalOpen}
                  page="SAVING ACCOUNT"
                  transactionType="deposit"
                />
              }
            />
          ),
          style: itemStyle,
        },
        {
          key: "withdraw",
          label: (
            <CreateModal
              pageTitle={""}
              isModalOpen={isWithdrawModalOpen}
              setIsModalOpen={setIsWithdrawModalOpen}
              icon={<ArrowDownOutlined />}
              text={false}
              buttonTitle={"Withdraw"}
              submitType="update"
              iconOnly={false}
              buttonWidth
              CreateForm={
                <TransactionForm
                  setIsModalOpen={setIsWithdrawModalOpen}
                  saving={saving}
                  page="SAVING ACCOUNT"
                  transactionType="withdraw"
                />
              }
            />
          ),
          style: itemStyle,
        },
        {
          key: "Transfer Funds",
          label: (
            <CreateModal
              pageTitle={""}
              isModalOpen={isTransferFundsModalOpen}
              setIsModalOpen={setIsTransferFundsModalOpen}
              icon={<DoubleRightOutlined />}
              text={false}
              buttonTitle={"Transfer Funds"}
              submitType="update"
              iconOnly={false}
              buttonWidth
              width={800}
              CreateForm={
                <TransferForm
                  setIsModalOpen={setIsTransferFundsModalOpen}
                  saving={saving}
                  page="SAVING ACCOUNT"
                />
              }
            />
          ),
          style: itemStyle,
        },
        {
          key: "close",
          label: (
            <CreateModal
              pageTitle={""}
              isModalOpen={isCloseModalOpen}
              setIsModalOpen={setIsCloseModalOpen}
              icon={<CloseOutlined />}
              text={false}
              buttonTitle={
                saving.savingsProduct.depositTypeEnum === "FIXED DEPOSIT"
                  ? "premature close"
                  : "close"
              }
              submitType="update"
              iconOnly={false}
              buttonWidth
              CreateForm={
                <CloseForm
                  setIsModalOpen={setIsCloseModalOpen}
                  saving={saving}
                  page="SAVING ACCOUNT"
                  transactionType="withdraw"
                />
              }
            />
          ),
          style: itemStyle,
        }
      );

      if (saving.savingsProduct.depositTypeEnum === "FIXED DEPOSIT") {
        items.splice(2, 2);
      }

      if (saving.groupId) {
        items.splice(4, 1);
      }
    }

    if (
      saving.statusEnum === "REJECTED" ||
      saving.statusEnum === "CLOSED" ||
      saving.statusEnum === "WITHDRAWN BY CLIENT"
    ) {
      items.splice(0, 2);
      items.splice(1);
    }
  }

  let availableBalance = saving?.accountBalanceDerived ?? 0;

  // If there's a minimum required balance, subtract it (ensuring it doesn’t go negative)
  if (saving?.minRequiredBalance) {
    availableBalance -= saving.minRequiredBalance;
  }

  // If an overdraft limit exists, adjust available balance accordingly
  if (saving?.overdraftLimit) {
    availableBalance += saving.overdraftLimit;
  }

  const handleIconClick = () => {
    setShowMenu((prevState) => !prevState);
  };

  if (savingStatus === "pending") {
    return <Skeleton />;
  }

  if (savingStatus === "error") {
    return (
      <Alert_
        message={"Error"}
        description={savingError.message}
        type={"error"}
      />
    );
  }

  let borderColor;
  switch (saving.statusEnum) {
    case "SUBMITTED AND AWAITING APPROVAL":
      borderColor = "border-orange-600";
      break;
    case "REJECTED":
    case "CLOSED":
    case "WITHDRAWN BY CLIENT":
      borderColor = "border-gray-700";
      break;
    case "APPROVED":
      borderColor = "border-blue-600";
      break;
    default:
      borderColor = "border-green-700";
  }

  if (savingStatus === "success" && saving) {
    return (
      <>
        <div
          className={`flex justify-between items-center mb-3 
          
          bg-slate-200 border-l-8 ${borderColor} shadow-lg rounded-xl px-6 py-4 mb-6 relative`}
        >
          <div className="flex gap-3">
            {/* <Avatar size={200} shape="square" icon={<MoneyCollectOutlined />} /> */}
            <table className="font-bold ">
              <tbody>
                {/* Saving Account */}
                <tr className="text-lg !mb-0">
                  <td className="pr-4 text-xl">Saving Account</td>
                  <td className="pr-2">:</td>
                  <td>
                    {saving.savingsProduct?.name} #{saving.accountNo}
                  </td>
                </tr>

                {/* Client/Group Name */}
                <tr className="text-base !bg-transparent">
                  <td className="pr-4 bg-transparent">
                    {saving.client ? "Client" : "Group"} Name
                  </td>
                  <td className="pr-2">:</td>
                  <td>
                    <Link
                      href={`/${tenantId}/${
                        saving.client ? "clients" : "groups"
                      }/${id}`}
                      className="hover:underline hover:text-gray-400"
                    >
                      {saving.client
                        ? saving.client?.firstName
                          ? `${saving.client?.firstName} ${
                              saving.client?.middleName || ""
                            } ${saving.client?.lastName}`
                          : saving.client.fullName
                        : saving.group?.name}{" "}
                      #{saving.client?.accountNo ?? saving.group?.accountNo}
                    </Link>
                  </td>
                </tr>

                {/* Current Balance */}
                {(saving.statusEnum === "APPROVED" ||
                  saving.statusEnum === "ACTIVE") && (
                  <tr className="text-md">
                    <td className="pr-4">Current Balance</td>
                    <td className="pr-2">:</td>
                    <td>
                      {saving.currencyCode}{" "}
                      {formatNumber(saving.accountBalanceDerived, 2)}
                    </td>
                  </tr>
                )}

                {/* Available Balance */}
                {(saving.statusEnum === "APPROVED" ||
                  saving.statusEnum === "ACTIVE") && (
                  <tr className="text-md !bg-transparent">
                    <td className="pr-4">Available Balance</td>
                    <td className="pr-2">:</td>
                    <td>
                      {saving.currencyCode}{" "}
                      {availableBalance && availableBalance <= 0
                        ? "0"
                        : formatNumber(Number(availableBalance), 2)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <>
            <MenuOutlined
              className="absolute top-4 right-4 text-2xl hover:cursor-pointer"
              onClick={handleIconClick}
            />
            {showMenu && (
              <div
                ref={menuRef}
                className="absolute top-[3rem] right-4 z-20 p-0 rounded-lg shadow-xl shadow-gray-400"
              >
                <Menu
                  mode="vertical"
                  className="rounded-lg px-1"
                  items={items}
                />
              </div>
            )}
          </>
        </div>

        <Tabs items={pages} />
      </>
    );
  }

  // Fallback in case clientStatus does not match any expected state
  return null;
}
