"use client";
import React, { useState, useRef } from "react";
import { Menu, MenuProps, Tabs } from "antd";
import { useGet, useGetById } from "@/api";
import { Loan, LoanRepaymentSchedule } from "@/types";
import General from "./general";
import {
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  MenuOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  UndoOutlined,
  UnorderedListOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import Alert_ from "@/components/alert";
import CreateModal from "@/components/create.modal";
import ApproveForm from "../../components/loans/approve.form";
import RejectForm from "../../components/loans/reject.form";
import DisburseForm from "../../components/loans/disburse.form";
import AssignLoanOfficerForm from "../../components/loans/assigin-loan-officer.form";
import AddLoanChargerForm from "./charges/add-loan-charge";
import Transactions from "./transactions";
import RepaymentSchedule from "./repayment-schedule";
import ForeClosureForm from "../../components/loans/foreclosure.form";
import { useParams } from "next/navigation";
import LoanDocument from "./loan-documents/loan-document";
import CreateForm from "../../components/loans/create.form";
import Note from "./notes/note";
import WithdrawForm from "./withdraw.form";
import Loading from "@/components/loading";
import CollateralDataTable from "./collateral/collateral.data-table";
import GuarantorDataTable from "./guarantors/guarantor.data-table";
import Charges from "./charges/charges";
import Link from "next/link";
import { formatNumber } from "@/utils/numbers";

type MenuItem = Required<MenuProps>["items"][number];

export default function LoanPage() {
  const { tenantId, id, loanId } = useParams();
  console.log(loanId);
  const {
    status: loanStatus,
    data: loan,
    error: loanError,
  } = useGetById<Loan>(`${tenantId}/loans`, `${loanId}`);

  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isLoanChargeModalOpen, setIsLoanChargeModalOpen] = useState(false);
  const [isLoanOfficerModalOpen, setIsLoanOfficerModalOpen] = useState(false);
  const [isModifyModalOpen, setIsModifyModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isDisburseModalOpen, setIsDisburseModalOpen] = useState(false);
  const [isDisburseToSavingsModalOpen, setIsDisburseToSavingsModalOpen] =
    useState(false);
  const [isUndoApprovalModalOpen, setIsUndoApprovalModalOpen] = useState(false);
  const [isLoanScreenReportsModalOpen, setIsLoanScreenReportsModalOpen] =
    useState(false);
  const [isForeClosureModalOpen, setIsForeClosureModalOpen] = useState(false);
  const [isMakeRepaymentModalOpen, setIsMakeRepaymentModalOpen] =
    useState(false);
  const [isUndoDisbursalModalOpen, setIsUndoDisbursalModalOpen] =
    useState(false);
  const [isRepayLoanModalOpen, setIsRepayLoanModalOpen] = useState(false);
  const [isWaiveInterestModalOpen, setIsWaiveInterestModalOpen] =
    useState(false);
  const [isWriteOffModalOpen, setIsWriteOffModalOpen] = useState(false);
  const [isReAmortizeModalOpen, setIsReAmortizeModalOpen] = useState(false);

  const lId = loanId;

  const filterParam = encodeURIComponent(
    JSON.stringify({
      where: { loanId: lId, obligationsMetOnDate: null },
      order: ["installment DESC"],
    })
  );

  let {
    status: repaymentSchedulesStatus,
    data: repaymentSchedules,
    error: repaymentSchedulesError,
  } = useGet<LoanRepaymentSchedule[]>(
    `${tenantId}/loan-repayment-schedules`,
    [`${tenantId}/loan-repayment-schedules-${lId}-form`],
    `?filter=${filterParam}`
  );

  let paymentAmount = 0;
  let repaymentScheduleId;
  let foreclosureRepaymentSchedule;

  if (repaymentSchedulesStatus === "success" && repaymentSchedules) {
    for (const rs of repaymentSchedules) {
      let due = rs.principalAmount + rs.interestAmount;
      let outstanding = due;

      // Adjust outstanding by subtracting any paid amount in advance
      if (rs.totalPaidInAdvanceDerived) {
        outstanding -= rs.totalPaidInAdvanceDerived;
      }

      if (rs.id) repaymentScheduleId = rs.id;

      if (rs) foreclosureRepaymentSchedule = rs;

      // Check if the outstanding amount is less than the due amount
      if (outstanding < due) {
        paymentAmount = outstanding;
        break; // Exit the loop once we have our desired value
      }

      // Update paymentAmount to the current outstanding amount
      paymentAmount = outstanding;
    }
  }

  //this is to be used by the foreclosure form
  const [balancesOfLoan, setBalancesOfLoan] = useState<number[]>([]);

  let pages = [
    {
      label: "General",
      key: "1",
      children: <General loan={loan} />,
    },

    {
      label: "Repayment Schedule",
      key: "3",
      children: (
        <RepaymentSchedule
          loanId={`${loanId}`}
          loan={loan}
          balancesOfLoan={balancesOfLoan}
          setBalancesOfLoan={setBalancesOfLoan}
        />
      ),
    },
    {
      label: "Transactions",
      key: "2",
      children: <Transactions loanId={`${loanId}`} />,
    },
    {
      label: "Charges",
      key: "charges",
      children: <Charges loan={loan} />,
    },
    {
      label: "Loan Collateral",
      key: "loan-collateral",
      children: <CollateralDataTable />,
    },
    {
      label: "Guarantors",
      key: "guarantors",
      children: <GuarantorDataTable />,
    },
    {
      label: "Loan Documents",
      key: "4",
      children: <LoanDocument />,
    },

    {
      label: "Notes",
      key: "5",
      children: <Note />,
    },
  ];

  if (loan?.loanStatusEnum === "APPROVED") {
    pages.splice(2, 1);
  }

  if (
    loan?.loanStatusEnum === "SUBMITTED AND AWAITING APPROVAL" ||
    loan?.loanStatusEnum === "WITHDRAWN BY CLIENT"
  ) {
    pages.splice(1, 2);
  }

  const itemStyle = { backgroundColor: "#ffff", padding: "0px" };

  let items: MenuItem[] = [
    {
      key: "Assign Loan Officer",
      label: (
        <CreateModal
          pageTitle={""}
          icon={<UserAddOutlined title={"Assign Loan Officer"} />}
          text={false}
          buttonTitle={"Assign Loan Officer"}
          submitType="update"
          isModalOpen={isLoanOfficerModalOpen}
          setIsModalOpen={setIsLoanOfficerModalOpen}
          iconOnly={false}
          buttonWidth
          CreateForm={
            <AssignLoanOfficerForm
              id={loan?.id}
              loanOfficerId={loan?.loanOfficerId}
              setIsModalOpen={setIsLoanOfficerModalOpen}
            />
          }
        />
      ),
      style: itemStyle,
    },
    {
      key: "Add Loan Charge",
      label: (
        <>
          {loan && (
            <>
              <CreateModal
                pageTitle={""}
                isModalOpen={isLoanChargeModalOpen}
                setIsModalOpen={setIsLoanChargeModalOpen}
                icon={<PlusOutlined title={"Add Loan Charge"} />}
                text={false}
                buttonTitle={"Add Loan Charge"}
                submitType="update"
                iconOnly={false}
                buttonWidth
                CreateForm={
                  <AddLoanChargerForm
                    loan={loan}
                    submitType="create"
                    setIsModalOpen={setIsLoanChargeModalOpen}
                  />
                }
              />
            </>
          )}
        </>
      ),
      style: itemStyle,
    },
    {
      key: "Approve Loan",
      label: (
        <CreateModal
          pageTitle={""}
          isModalOpen={isApproveModalOpen}
          setIsModalOpen={setIsApproveModalOpen}
          icon={<CheckOutlined title={"Approve"} />}
          text={false}
          buttonTitle={"Approve"}
          submitType="update"
          iconOnly={false}
          buttonWidth
          CreateForm={
            <ApproveForm
              expectedDisbursedOnDate={loan?.expectedDisbursedOnDate}
              id={loan?.id}
              clientId={loan?.clientId}
              loan={loanStatus === "success" ? loan : undefined}
              page="LOAN ACCOUNT"
              setIsModalOpen={setIsApproveModalOpen}
            />
          }
        />
      ),
      style: itemStyle,
    },
    {
      key: "Modify Application",
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
          width={1100}
          CreateForm={
            <CreateForm
              loanId={loan?.id}
              submitType="update"
              setIsModalOpen={setIsModifyModalOpen}
            />
          }
        />
      ),
      style: itemStyle,
    },
    {
      key: "Reject Application",
      label: (
        <CreateModal
          pageTitle={""}
          isModalOpen={isRejectModalOpen}
          setIsModalOpen={setIsRejectModalOpen}
          icon={<CloseOutlined title={"Reject"} />}
          text={false}
          buttonTitle={"Reject"}
          submitType="update"
          buttonWidth
          iconOnly={false}
          CreateForm={
            <RejectForm
              expectedDisbursedOnDate={loan?.disbursementOn}
              id={loan?.id}
            />
          }
        />
      ),
      style: itemStyle,
    },
    {
      key: "withdrawn-by-client",
      label: (
        <CreateModal
          pageTitle={""}
          isModalOpen={isWithdrawModalOpen}
          setIsModalOpen={setIsWithdrawModalOpen}
          icon={<CloseOutlined title={"Withdraw By Client"} />}
          text={false}
          buttonTitle={"Withdraw By Client"}
          submitType="update"
          iconOnly={false}
          buttonWidth
          CreateForm={<WithdrawForm loan={loan} />}
        />
      ),
      style: itemStyle,
    },
  ];

  if (loan) {
    if (loan.loanStatusEnum === "APPROVED") {
      items.splice(2);

      items.push(
        {
          key: "Disburse",
          label:
            loanStatus === "success" ? (
              <CreateModal
                pageTitle={""}
                isModalOpen={isDisburseModalOpen}
                setIsModalOpen={setIsDisburseModalOpen}
                icon={<PlayCircleOutlined title={"Disburse"} />}
                text={false}
                buttonTitle={"Disburse"}
                submitType="update"
                iconOnly={false}
                buttonWidth
                CreateForm={<DisburseForm loan={loan} page="LOAN ACCOUNT" />}
              />
            ) : null,
          style: itemStyle,
        },
        {
          key: "Disburse To Savings",
          label: (
            <CreateModal
              pageTitle={""}
              isModalOpen={isDisburseToSavingsModalOpen}
              setIsModalOpen={setIsDisburseToSavingsModalOpen}
              icon={<PlayCircleOutlined title={"Disburse To Savings"} />}
              text={false}
              buttonTitle={"Disburse To Savings"}
              submitType="update"
              iconOnly={false}
              buttonWidth
              CreateForm={
                <DisburseForm
                  loan={loan}
                  page="LOAN ACCOUNT"
                  disburseToSavings={true}
                />
              }
            />
          ),
          style: itemStyle,
        },
        {
          key: "Undo Approval",
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
                  expectedDisbursedOnDate={""}
                  id={loan?.id}
                  clientId={loan?.clientId}
                  loan={loan}
                  undoApproval
                  page="LOAN ACCOUNT"
                  setIsModalOpen={setIsModifyModalOpen}
                />
              }
            />
          ),
          style: itemStyle,
        },

        {
          key: "Loan Screen Reports",
          label: (
            <CreateModal
              pageTitle={""}
              isModalOpen={isLoanScreenReportsModalOpen}
              setIsModalOpen={setIsLoanScreenReportsModalOpen}
              icon={<UnorderedListOutlined />}
              text={false}
              buttonTitle={"Loan Screen Reports"}
              submitType="update"
              iconOnly={false}
              buttonWidth
              CreateForm={
                <ApproveForm
                  expectedDisbursedOnDate={""}
                  id={loan?.id}
                  clientId={loan?.clientId}
                  loan={loan}
                  undoApproval
                  page="LOAN ACCOUNT"
                  setIsModalOpen={setIsModifyModalOpen}
                />
              }
            />
          ),
          style: itemStyle,
        }
      );
    }

    if (
      loan.loanStatusEnum === "ACTIVE" ||
      loan.loanStatusEnum === "OVERDUE" ||
      loan.loanStatusEnum === "OVERDUE NPA"
    ) {
      items.splice(2);

      items.push(
        {
          key: "Foreclosure",
          label: (
            <CreateModal
              pageTitle={""}
              isModalOpen={isForeClosureModalOpen}
              setIsModalOpen={setIsForeClosureModalOpen}
              icon={<CheckOutlined title={"Foreclosure"} />}
              text={false}
              buttonTitle={"Foreclosure"}
              submitType="update"
              iconOnly={false}
              buttonWidth
              CreateForm={
                <ForeClosureForm
                  loan={loan}
                  foreclosureRepaymentSchedule={foreclosureRepaymentSchedule}
                  balancesOfLoan={balancesOfLoan}
                  setBalancesOfLoan={setBalancesOfLoan}
                />
              }
            />
          ),
          style: itemStyle,
        },
        {
          key: "Undo Disbursal",
          label:
            loanStatus === "success" ? (
              <CreateModal
                pageTitle={""}
                isModalOpen={isUndoDisbursalModalOpen}
                setIsModalOpen={setIsUndoDisbursalModalOpen}
                icon={<UndoOutlined title={"Undo Disbursal"} />}
                text={false}
                buttonTitle={"Undo Disbursal"}
                submitType="update"
                iconOnly={false}
                buttonWidth
                CreateForm={
                  <DisburseForm loan={loan} undoDisbursal page="LOAN ACCOUNT" />
                }
              />
            ) : null,
          style: itemStyle,
        },
        {
          key: "Repay Loan",
          label: (
            <CreateModal
              pageTitle={""}
              isModalOpen={isRepayLoanModalOpen}
              setIsModalOpen={setIsRepayLoanModalOpen}
              icon={<CheckOutlined title={"Repay Loan"} />}
              text={false}
              buttonTitle={"Repay Loan"}
              submitType="update"
              iconOnly={false}
              buttonWidth
              CreateForm={
                <ApproveForm
                  expectedDisbursedOnDate={""}
                  id={loan?.id}
                  clientId={loan?.clientId}
                  loan={loan}
                  undoApproval
                  page="LOAN ACCOUNT"
                  setIsModalOpen={setIsModifyModalOpen}
                />
              }
            />
          ),
          style: itemStyle,
        },
        {
          key: "Waive Interest",
          label: (
            <CreateModal
              pageTitle={""}
              isModalOpen={isWaiveInterestModalOpen}
              setIsModalOpen={setIsWaiveInterestModalOpen}
              icon={<CheckOutlined title={"Waive Interest"} />}
              text={false}
              buttonTitle={"Reschedule"}
              submitType="update"
              iconOnly={false}
              buttonWidth
              CreateForm={
                <ApproveForm
                  expectedDisbursedOnDate={""}
                  id={loan?.id}
                  clientId={loan?.clientId}
                  loan={loan}
                  undoApproval
                  page="LOAN ACCOUNT"
                  setIsModalOpen={setIsModifyModalOpen}
                />
              }
            />
          ),
          style: itemStyle,
        },
        {
          key: "Write-off",
          label: (
            <CreateModal
              pageTitle={""}
              isModalOpen={isWriteOffModalOpen}
              setIsModalOpen={setIsWriteOffModalOpen}
              icon={<CheckOutlined title={"Write-off"} />}
              text={false}
              buttonTitle={"Write-off"}
              submitType="update"
              iconOnly={false}
              buttonWidth
              CreateForm={
                <ApproveForm
                  expectedDisbursedOnDate={""}
                  id={loan?.id}
                  clientId={loan?.clientId}
                  loan={loan}
                  undoApproval
                  page="LOAN ACCOUNT"
                  setIsModalOpen={setIsModifyModalOpen}
                />
              }
            />
          ),
          style: itemStyle,
        },
        {
          key: "Re-Amortize",
          label: (
            <CreateModal
              pageTitle={""}
              isModalOpen={isReAmortizeModalOpen}
              setIsModalOpen={setIsReAmortizeModalOpen}
              icon={<CheckOutlined title={"Re-Amortize"} />}
              text={false}
              buttonTitle={"Re-Amortize"}
              submitType="update"
              iconOnly={false}
              buttonWidth
              CreateForm={
                <ApproveForm
                  expectedDisbursedOnDate={""}
                  id={loan?.id}
                  clientId={loan?.clientId}
                  loan={loan}
                  undoApproval
                  page="LOAN ACCOUNT"
                  setIsModalOpen={setIsModifyModalOpen}
                />
              }
            />
          ),
          style: itemStyle,
        }
      );
    }
  }

  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleIconClick = () => {
    setShowMenu((prevState) => !prevState);
  };

  if (loanStatus === "pending") {
    return <Loading />;
  }

  if (loanStatus === "error") {
    return (
      <Alert_
        message={"Error"}
        description={loanError.message}
        type={"error"}
      />
    );
  }

  let borderColor;
  switch (loan.loanStatusEnum) {
    case "SUBMITTED AND AWAITING APPROVAL":
      borderColor = "border-orange-600";
      break;
    case "REJECTED":
    case "WITHDRAWN BY CLIENT":
      borderColor = "border-gray-700";
      break;
    case "APPROVED":
      borderColor = "border-blue-600";
      break;
    case "OVERDUE":
    case "OVERDUE NPA":
      borderColor = "border-red-600";
      break;
    default:
      borderColor = "border-green-700";
  }

  if (loanStatus === "success" && loan) {
    return (
      <>
        <div
          className={`flex justify-between items-center mb-3 bg-slate-200 border-l-8 ${borderColor} shadow-lg rounded-xl px-6 py-4 mb-6 relative`}
        >
          <div className="flex gap-3 font-bold ">
            <div>
              <div className="text-xl flex justify-start items-center gap-3">
                {/* <TableRowStatus status={loan.isActive} />{" "} */}
                <span>Loan Product </span>
                <span className="ml-3">
                  : {loan.loanProduct.name} #{loan.accountNo}
                </span>
              </div>
              <div className="text-lg flex justify-start items-center gap-3">
                <span>
                  {loan.loanTypeEnum === "INDIVIDUAL LOAN" ? "Client" : "Group"}{" "}
                  Name
                </span>
                <span className="ml-9">
                  :{" "}
                  <Link
                    href={`/${tenantId}/${
                      loan.loanTypeEnum === "INDIVIDUAL LOAN"
                        ? "clients"
                        : "groups"
                    }/${id}`}
                    className="hover:underline hover:text-white"
                  >
                    {loan.loanTypeEnum === "INDIVIDUAL LOAN"
                      ? loan.client?.firstName
                        ? `${loan.client?.firstName} ${
                            loan.client?.middleName || ""
                          } ${loan.client?.lastName}`
                        : loan.client?.fullName
                      : loan.group?.name}
                    {" #"}
                    {loan.loanTypeEnum === "INDIVIDUAL LOAN"
                      ? loan.client?.accountNo
                      : loan.group?.accountNo}
                  </Link>
                </span>
              </div>
              {(loan.loanStatusEnum === "ACTIVE" ||
                loan.loanStatusEnum === "OVERDUE" ||
                loan.loanStatusEnum === "OVERDUE NPA") && (
                <div className="text-lg flex justify-start items-center gap-3">
                  <span>Current Balance</span>
                  <span>
                    :{" "}
                    {loan.totalOutstandingDerived < 0
                      ? `0`
                      : formatNumber(loan.totalOutstandingDerived)}
                  </span>
                </div>
              )}
              {(loan.loanStatusEnum === "OVERDUE" ||
                loan.loanStatusEnum === "OVERDUE NPA") &&
                loan.loanArrearsAging && (
                  <div className="text-md flex justify-start items-center gap-3">
                    <span>Arrears By</span>
                    <span className="ml-[4.3rem]">
                      :{" "}
                      {formatNumber(loan.loanArrearsAging.totalOverdueDerived)}
                    </span>
                  </div>
                )}
            </div>
          </div>
          {loan.loanStatusEnum !== "REJECTED" &&
            loan.loanStatusEnum !== "WITHDRAWN BY CLIENT" && (
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

  // Fallback in case clientStatus does not match any expected state
  return null;
}
