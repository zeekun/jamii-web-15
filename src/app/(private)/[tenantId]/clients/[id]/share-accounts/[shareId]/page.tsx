"use client";
import React, { useState, useRef } from "react";
import { Menu, MenuProps, Skeleton, Tabs } from "antd";
import { useGetById } from "@/api";
import { ShareAccount } from "@/types";
import General from "./general";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  MenuOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import Alert_ from "@/components/alert";
import CreateModal from "@/components/create.modal";
import Transactions from "./transactions";
import CreateForm from "../../components/shares/create.form";
import { MODAL_WIDTH } from "../../components/shares/constants";
import { useParams } from "next/navigation";
import ApproveForm from "../../components/shares/approve.form";
import ActivateForm from "../../components/shares/activate.form";
import RejectForm from "../../components/shares/reject.form";
import ShareTransactionForm from "./additional-share-transaction.form";
import CloseForm from "../../components/shares/close.form";
import Link from "next/link";
import Charges from "./charges";

type MenuItem = Required<MenuProps>["items"][number];

export default function ShareAccountPage() {
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isModifyModalOpen, setIsModifyModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isUndoApprovalModalOpen, setIsUndoApprovalModalOpen] = useState(false);
  const [isActivateModalOpen, setIsActivateModalOpen] = useState(false);
  const [isAdditionalModalOpen, setIsAdditionalModalOpen] = useState(false);

  const { tenantId, id, shareId } = useParams();
  const {
    status: shareStatus,
    data: share,
    error: shareError,
  } = useGetById<ShareAccount>(`${tenantId}/share-accounts`, Number(shareId));

  console.log(share);

  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const pages = [
    {
      label: "General",
      key: "1",
      children: <General share={share} />,
    },
    {
      label: "Transactions",
      key: "2",
      children: <Transactions />,
    },
    {
      label: "Charges",
      key: "3",
      children: <Charges shareId={`${shareId}`} />,
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
            <CreateForm
              shareAccountId={share?.id}
              setIsModalOpen={setIsModifyModalOpen}
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
            <ApproveForm setIsModalOpen={setIsApproveModalOpen} share={share} />
          }
        />
      ),
      style: itemStyle,
    },
    {
      key: "4",
      label: (
        <CreateModal
          pageTitle={""}
          isModalOpen={isRejectModalOpen}
          setIsModalOpen={setIsRejectModalOpen}
          icon={
            share?.statusEnum === "REJECTED" ? (
              <UndoOutlined title={"Undo Rejection"} />
            ) : (
              <CloseOutlined title={"Reject"} />
            )
          }
          text={false}
          buttonTitle={
            share?.statusEnum === "REJECTED" ? "Undo Rejection" : "Reject"
          }
          submitType="update"
          iconOnly={false}
          buttonWidth
          CreateForm={
            <RejectForm
              undoRejection={share?.statusEnum === "REJECTED" ? true : false}
            />
          }
        />
      ),
      style: itemStyle,
    },
  ];

  if (share?.statusEnum === "APPROVED") {
    items.splice(0);

    items.push(
      {
        key: "3",
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
                setIsModalOpen={setIsApproveModalOpen}
                share={share}
                undoApproval
              />
            }
          />
        ),
        style: itemStyle,
      },
      {
        key: "activate",
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
            CreateForm={<ActivateForm share={share} />}
          />
        ),
        style: itemStyle,
      }
    );
  } else if (share?.statusEnum === "ACTIVE") {
    items.splice(0);

    items.push(
      {
        key: "additional shares",
        label: (
          <CreateModal
            pageTitle={""}
            isModalOpen={isAdditionalModalOpen}
            setIsModalOpen={setIsAdditionalModalOpen}
            icon={<ArrowRightOutlined />}
            text={false}
            buttonTitle={"Apply Additional Shares"}
            submitType="update"
            iconOnly={false}
            buttonWidth
            CreateForm={
              <ShareTransactionForm
                transactionType="PURCHASE"
                share={share}
                page="SHARE ACCOUNT"
              />
            }
          />
        ),
        style: itemStyle,
      },
      {
        key: "redeem shares",
        label: (
          <CreateModal
            pageTitle={""}
            isModalOpen={isRedeemModalOpen}
            setIsModalOpen={setIsRedeemModalOpen}
            icon={<ArrowLeftOutlined />}
            text={false}
            buttonTitle={"Redeem Shares"}
            submitType="update"
            iconOnly={false}
            buttonWidth
            CreateForm={
              <ShareTransactionForm
                transactionType="REDEEM"
                share={share}
                page="SHARE ACCOUNT"
              />
            }
          />
        ),
        style: itemStyle,
      },
      {
        key: "close shares",
        label: (
          <CreateModal
            pageTitle={""}
            isModalOpen={isCloseModalOpen}
            setIsModalOpen={setIsCloseModalOpen}
            icon={<CloseOutlined />}
            text={false}
            buttonTitle={"Close"}
            submitType="update"
            iconOnly={false}
            buttonWidth
            CreateForm={
              <CloseForm setIsModalOpen={setIsCloseModalOpen} share={share} />
            }
          />
        ),
        style: itemStyle,
      }
    );
  }

  const handleIconClick = () => {
    setShowMenu((prevState) => !prevState);
  };

  if (shareStatus === "error") {
    return (
      <Alert_
        message={"Error"}
        description={shareError.message}
        type={"error"}
      />
    );
  } else if (shareStatus === "pending") {
    return <Skeleton />;
  } else if (shareStatus === "success" && share) {
    let borderColor;
    switch (share.statusEnum) {
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

    return (
      <>
        <div
          className={`flex justify-between items-center mb-3 
           bg-slate-200 border-l-8 ${borderColor} shadow-lg rounded-xl px-6 py-4 mb-6 relative`}
        >
          <div className="flex gap-3">
            <div>
              <div className="text-xl font-bold flex justify-start items-center gap-3">
                <span>Share Account</span>
                <span>
                  : {share.shareProduct?.name} #{share.accountNo}
                </span>
              </div>
              <div className="text-lg font-bold flex justify-start items-center gap-3">
                <div> {share.client ? "Client" : "Group"} Name</div>
                <div className="ml-[2.3rem]">
                  :{" "}
                  <Link
                    href={`/${tenantId}/${
                      share.client ? "clients" : "groups"
                    }/${id}`}
                    className="hover:underline hover:text-gray-500"
                  >
                    <span>
                      {share.client
                        ? share.client?.firstName
                          ? `${share.client?.firstName} ${
                              share.client?.middleName || ""
                            } ${share.client?.lastName}`
                          : share.client.fullName
                        : share.group?.name}
                      {" #"}
                      {share.client?.accountNo ?? share.group?.accountNo}
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {share.statusEnum !== "CLOSED" && share.statusEnum !== "REJECTED" && (
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
          )}
        </div>

        <Tabs items={pages} />
      </>
    );
  }

  // Fallback in case shareStatus does not match any expected state
  return null;
}
