"use client";

import { useGet } from "@/api";
import { SavingsAccount } from "@/types";
import { useParams, useSearchParams } from "next/navigation";
import SavingsDataTable from "../components/savings/data-table";
import { useEffect, useState } from "react";
import MyButton from "@/components/my-button";
import { Typography } from "antd";

const { Title } = Typography;

export default function SavingsAccountsPage() {
  const { tenantId, id, groupId } = useParams();
  const searchParams = useSearchParams();
  const type = searchParams.get("type") as "client" | "group" | null; // Derive `type` from searchParams
  console.log(type);

  const [viewClosedSavingsAccounts, setViewClosedSavingsAccounts] =
    useState(false);
  const [savings, setSavings] = useState<SavingsAccount[] | undefined>();

  // Fetch open savings
  const {
    status: openSavingsStatus,
    data: openSavings,
    error: openSavingsError,
  } = useGet<SavingsAccount[]>(
    `${tenantId}/${type === "client" ? "clients" : "groups"}/${
      type === "client" ? id : groupId
    }/savings-accounts?filter={"where":{"statusEnum":{"neq":"CLOSED"},"tenantId":${tenantId}},"order":["accountNo DESC"]}`,
    id
      ? [
          `${tenantId}/${type === "client" ? "clients" : "groups"}/${
            type === "client" ? id : groupId
          }/savings-accounts?filter={"where":{"statusEnum":{"neq":"CLOSED"},"tenantId":${tenantId}}},"order":["accountNo DESC"]}`,
        ]
      : []
  );

  // Fetch closed savings
  const {
    status: closedSavingsStatus,
    data: closedSavings,
    error: closedSavingsError,
  } = useGet<SavingsAccount[]>(
    `${tenantId}/${type === "client" ? "clients" : "groups"}/${
      type === "client" ? id : groupId
    }/savings-accounts?filter={"where":{"statusEnum":"CLOSED","tenantId":${tenantId}}}`,
    id
      ? [
          `${tenantId}/${type === "client" ? "clients" : "groups"}/${
            type === "client" ? id : groupId
          }/savings-accounts?filter={"where":{"statusEnum":"CLOSED","tenantId":${tenantId}}}`,
        ]
      : []
  );

  // Toggle between open and closed savings
  useEffect(() => {
    if (
      viewClosedSavingsAccounts &&
      closedSavingsStatus === "success" &&
      closedSavings
    ) {
      setSavings(closedSavings);
    } else if (
      !viewClosedSavingsAccounts &&
      openSavingsStatus === "success" &&
      openSavings
    ) {
      setSavings(openSavings);
    }
  }, [
    viewClosedSavingsAccounts,
    closedSavingsStatus,
    closedSavings,
    openSavingsStatus,
    openSavings,
  ]);

  // Set open savings initially
  useEffect(() => {
    if (openSavingsStatus === "success" && openSavings) {
      setSavings(openSavings);
    }
  }, [openSavingsStatus, openSavings]);

  const showClosedSavingsAccounts = () => {
    setViewClosedSavingsAccounts(!viewClosedSavingsAccounts);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-2">
        <Title level={5}>Savings Accounts</Title>
        <MyButton
          type={viewClosedSavingsAccounts ? "green" : "gray"}
          onClick={showClosedSavingsAccounts}
        >
          {viewClosedSavingsAccounts
            ? "View Open Accounts"
            : "View Closed Accounts"}
        </MyButton>
      </div>
      {savings && savings.length > 0 && (
        <SavingsDataTable
          type={type || "client"} // Default to "client" if `type` is not provided
          data={savings}
          loading={
            openSavingsStatus === "pending" || closedSavingsStatus === "pending"
          }
        />
      )}
    </>
  );
}
