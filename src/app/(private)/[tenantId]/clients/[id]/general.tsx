import { Typography } from "antd";
import LoansDataTable from "./components/loans/data-table";
import { Client, Loan, SavingsAccount, ShareAccount } from "@/types";
import { useGet } from "@/api";
import { useEffect, useState } from "react";
import SavingsDataTable from "./components/savings/data-table";
import ShareDataTable from "./components/shares/data-table";
import { useParams } from "next/navigation";
import MyButton from "@/components/my-button";

const { Title } = Typography;

export default function General(props: { client: Client | undefined }) {
  const { tenantId, id } = useParams();
  const { client } = props;
  const [viewClosedAccounts, setViewClosedAccounts] = useState(false);
  const [viewClosedSavingsAccounts, setViewClosedSavingsAccounts] =
    useState(false);
  const [viewClosedShareAccounts, setViewClosedShareAccounts] = useState(false);
  const [loans, setLoans] = useState<Loan[] | undefined>();
  const [savings, setSavings] = useState<SavingsAccount[] | undefined>();
  const [shares, setShares] = useState<ShareAccount[] | undefined>();

  // Fetch open loans
  const {
    status: openLoanStatus,
    data: openLoans,
    error: openLoansError,
  } = useGet<Loan[]>(
    `${tenantId}/clients/${id}/loans?filter={"where":{"loanStatusEnum":{"neq":"REJECTED"}},"order":["id DESC"]}`,
    [
      `${tenantId}/clients/${id}/loans?filter={"where":{"loanStatusEnum":{"neq":"REJECTED"}},"order":["id DESC"]}`,
    ]
  );

  // Fetch closed loans
  const {
    status: closedLoanStatus,
    data: closedLoans,
    error: closedLoansError,
  } = useGet<Loan[]>(
    `${tenantId}/clients/${id}/loans?filter={"where":{"loanStatusEnum":"REJECTED"}}`,
    [
      `${tenantId}/clients/${id}/loans?filter={"where":{"loanStatusEnum":"REJECTED"}}`,
    ]
  );

  // Set loans to open loans initially
  useEffect(() => {
    if (openLoanStatus === "success" && openLoans) {
      setLoans(openLoans);
    }
  }, [openLoanStatus, openLoans]);

  // Toggle between open and closed loans
  useEffect(() => {
    if (viewClosedAccounts && closedLoanStatus === "success" && closedLoans) {
      setLoans(closedLoans);
    } else if (
      !viewClosedAccounts &&
      openLoanStatus === "success" &&
      openLoans
    ) {
      setLoans(openLoans);
    }
  }, [
    viewClosedAccounts,
    closedLoanStatus,
    closedLoans,
    openLoanStatus,
    openLoans,
  ]);

  const showClosedAccounts = () => {
    setViewClosedAccounts(!viewClosedAccounts);
  };

  // Fetch open savings
  const {
    status: openSavingsStatus,
    data: openSavings,
    error: openSavingsError,
  } = useGet<SavingsAccount[]>(
    `${tenantId}/clients/${id}/savings-accounts?filter={"where":{"statusEnum":{"neq":"CLOSED"}},"order":["accountNo DESC"]}`,
    [
      `${tenantId}/clients/${id}/savings-accounts?filter={"where":{"statusEnum":{"neq":"CLOSED"}},"order":["accountNo DESC"]}`,
    ]
  );

  // Fetch closed savings
  const {
    status: closedSavingsStatus,
    data: closedSavings,
    error: closedSavingsError,
  } = useGet<SavingsAccount[]>(
    `${tenantId}/clients/${id}/savings-accounts?filter={"where":{"statusEnum":"CLOSED"}}`,
    [
      `${tenantId}/clients/${id}/savings-accounts?filter={"where":{"statusEnum":"CLOSED"}}`,
    ]
  );

  // Set open savings initially
  useEffect(() => {
    if (openSavingsStatus === "success" && openSavings) {
      setSavings(openSavings);
    }
  }, [openSavingsStatus, openSavings]);

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

  const showClosedSavingsAccounts = () => {
    setViewClosedSavingsAccounts(!viewClosedSavingsAccounts);
  };

  // Fetch open shares
  const {
    status: openSharesStatus,
    data: openShares,
    error: openSharesError,
  } = useGet<ShareAccount[]>(
    `${tenantId}/clients/${id}/share-accounts?filter={"where":{"statusEnum":{"neq":"CLOSED"}},"order":["accountNo DESC"]}`,
    [
      `${tenantId}/clients/${id}/share-accounts?filter={"where":{"statusEnum":{"neq":"CLOSED"}},"order":["accountNo DESC"]}`,
    ]
  );

  // Fetch closed shares
  const {
    status: closedSharesStatus,
    data: closedShares,
    error: closedSharesError,
  } = useGet<ShareAccount[]>(
    `${tenantId}/clients/${id}/share-accounts?filter={"where":{"statusEnum":"CLOSED"}}`,
    [
      `${tenantId}/clients/${id}/share-accounts?filter={"where":{"statusEnum":"CLOSED"}}`,
    ]
  );

  // Set open shares initially
  useEffect(() => {
    if (openSharesStatus === "success" && openShares) {
      setShares(openShares);
    }
  }, [openSharesStatus, openShares]);

  // Toggle between open and closed shares
  useEffect(() => {
    if (
      viewClosedShareAccounts &&
      closedSharesStatus === "success" &&
      closedShares
    ) {
      setShares(closedShares);
    } else if (
      !viewClosedShareAccounts &&
      openSharesStatus === "success" &&
      openShares
    ) {
      setShares(openShares);
    }
  }, [
    viewClosedShareAccounts,
    closedSharesStatus,
    closedShares,
    openSharesStatus,
    openShares,
  ]);

  const showClosedShareAccounts = () => {
    setViewClosedShareAccounts(!viewClosedShareAccounts);
  };

  return (
    <>
      {client?.statusEnum !== "REJECTED" &&
      client?.statusEnum !== "WITHDRAWN" &&
      client?.statusEnum !== "CLOSED" ? (
        <>
          {/* <Title level={5}>Performance History</Title>
          <div className="border-solid border-2 border-gray-400 p-3">
            <table className="w-full">
              <tbody>
                <tr key="row-1">
                  <td>No. Of Loan Cycles:</td>
                  <td>No. Of Active Savings:</td>
                </tr>
                <tr key="row-2">
                  <td>No. Of Active Loans:</td>
                  <td>Total Savings:</td>
                </tr>
                <tr key="row-3">
                  <td>Last Loan Amount:</td>
                </tr>
              </tbody>
            </table>
          </div> */}

          <div className="mt-3 border-solid border-2 p-2 border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <Title level={5}>Loan Accounts</Title>
              <MyButton
                type={viewClosedAccounts ? "green" : "gray"}
                size="small"
                onClick={showClosedAccounts}
              >
                {viewClosedAccounts
                  ? "View Open Accounts"
                  : "View Closed Accounts"}
              </MyButton>
            </div>
            {loans && loans.length > 0 && (
              <LoansDataTable
                data={loans}
                type="client"
                loading={
                  openLoanStatus === "pending" || closedLoanStatus === "pending"
                }
              />
            )}
          </div>

          <div className="mt-3 border-solid border-2 p-2 border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <Title level={5}>Savings Accounts</Title>
              <MyButton
                size="small"
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
                data={savings}
                type="client"
                loading={
                  openSavingsStatus === "pending" ||
                  closedSavingsStatus === "pending"
                }
              />
            )}
          </div>

          <div className="mt-3 border-solid border-2 p-2 border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <Title level={5}>Share Accounts</Title>
              <MyButton
                size="small"
                type={viewClosedShareAccounts ? "green" : "gray"}
                onClick={showClosedShareAccounts}
              >
                {viewClosedShareAccounts
                  ? "View Open Accounts"
                  : "View Closed Accounts"}
              </MyButton>
            </div>

            {shares && shares.length > 0 && (
              <ShareDataTable
                data={shares}
                type="client"
                loading={
                  openSharesStatus === "pending" ||
                  closedSharesStatus === "pending"
                }
              />
            )}
          </div>
        </>
      ) : (
        <Title>{client?.statusEnum}</Title>
      )}
    </>
  );
}
