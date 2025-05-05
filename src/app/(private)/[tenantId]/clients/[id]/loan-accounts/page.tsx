"use client";

import { useGet } from "@/api";
import { Loan } from "@/types";
import { useParams, useSearchParams } from "next/navigation";
import LoansDataTable from "../components/loans/data-table";
import { useEffect, useState } from "react";
import MyButton from "@/components/my-button";
import { Typography } from "antd";

const { Title } = Typography;

export default function LoansPage() {
  const { tenantId, id, groupId } = useParams();
  const searchParams = useSearchParams();
  const type = searchParams.get("type") as "client" | "group" | null; // Derive `type` from searchParams

  const [viewClosedLoans, setViewClosedLoans] = useState(false);
  const [loans, setLoans] = useState<Loan[] | undefined>();

  // Fetch open loans
  const {
    status: openLoansStatus,
    data: openLoans,
    error: openLoansError,
  } = useGet<Loan[]>(
    `${tenantId}/${type === "client" ? "clients" : "groups"}/${
      type === "client" ? id : groupId
    }/loans?filter={"where":{"loanStatusEnum":{"neq":"CLOSED"},"tenantId":${tenantId}},"order":["accountNo DESC"]}`,
    id
      ? [
          `${tenantId}/${type === "client" ? "clients" : "groups"}/${
            type === "client" ? id : groupId
          }/loans?filter={"where":{"loanStatusEnum":{"neq":"CLOSED"},"tenantId":${tenantId}}},"order":["accountNo DESC"]}`,
        ]
      : []
  );

  // Fetch closed loans
  const {
    status: closedLoansStatus,
    data: closedLoans,
    error: closedLoansError,
  } = useGet<Loan[]>(
    `${tenantId}/${type === "client" ? "clients" : "groups"}/${
      type === "client" ? id : groupId
    }/loans?filter={"where":{"loanStatusEnum":"CLOSED","tenantId":${tenantId}}}`,
    id
      ? [
          `${tenantId}/${type === "client" ? "clients" : "groups"}/${
            type === "client" ? id : groupId
          }/loans?filter={"where":{"loanStatusEnum":"CLOSED","tenantId":${tenantId}}}`,
        ]
      : []
  );

  // Toggle between open and closed loans
  useEffect(() => {
    if (viewClosedLoans && closedLoansStatus === "success" && closedLoans) {
      setLoans(closedLoans);
    } else if (!viewClosedLoans && openLoansStatus === "success" && openLoans) {
      setLoans(openLoans);
    }
  }, [
    viewClosedLoans,
    closedLoansStatus,
    closedLoans,
    openLoansStatus,
    openLoans,
  ]);

  // Set open loans initially
  useEffect(() => {
    if (openLoansStatus === "success" && openLoans) {
      setLoans(openLoans);
    }
  }, [openLoansStatus, openLoans]);

  const showClosedLoans = () => {
    setViewClosedLoans(!viewClosedLoans);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-2">
        <Title level={5}>Loans Accounts</Title>
        <MyButton
          type={viewClosedLoans ? "green" : "gray"}
          onClick={showClosedLoans}
        >
          {viewClosedLoans ? "View Open Accounts" : "View Closed Accounts"}
        </MyButton>
      </div>
      {loans && loans.length > 0 && (
        <LoansDataTable
          type={type || "client"} // Default to "client" if `type` is not provided
          data={loans}
          loading={
            openLoansStatus === "pending" || closedLoansStatus === "pending"
          }
        />
      )}
    </>
  );
}
