import { Button, Typography } from "antd";
import { Client, Group, Loan, SavingsAccount, ShareAccount } from "@/types";
import { useGet } from "@/api";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import MyButton from "@/components/my-button";
import LoansDataTable from "../../clients/[id]/components/loans/data-table";
import SavingsDataTable from "../../clients/[id]/components/savings/data-table";
import ClientsDataTable from "../../clients/data-table";
import Alert_ from "@/components/alert";
import CreateModal from "@/components/create.modal";
import CreateForm from "../../clients/create.form";
import Link from "next/link";
import { UsergroupAddOutlined, UserSwitchOutlined } from "@ant-design/icons";
import TransferClientForm from "./transfer-client.form";
import { useRoles } from "@/providers/RolesProvider";
import {
  createClientPermissions,
  readClientPermissions,
} from "../../clients/constants";
import { hasPermission } from "@/utils/permissions";
import AccessDenied from "@/components/access-denied";
import { associateClientsGroupsPermissions } from "../constants";
import ShareDataTable from "../../clients/[id]/components/shares/data-table";

const { Title } = Typography;

export default function General(props: { group: Group | undefined }) {
  const { tenantId, groupId } = useParams();
  const { group } = props;
  const [viewClosedAccounts, setViewClosedAccounts] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [viewClosedShareAccounts, setViewClosedShareAccounts] = useState(false);
  const [viewClosedSavingsAccounts, setViewClosedSavingsAccounts] =
    useState(false);
  const [loans, setLoans] = useState<Loan[] | undefined>();
  const [savings, setSavings] = useState<SavingsAccount[] | undefined>();
  const [shares, setShares] = useState<ShareAccount[] | undefined>();

  const {
    permissions,
    error: permissionsError,
    isPermissionsLoading,
  } = useRoles();

  const canReadClients = hasPermission(permissions, readClientPermissions);
  const canCreateClients = hasPermission(permissions, createClientPermissions);
  const canAssociateClientsGroups = hasPermission(
    permissions,
    associateClientsGroupsPermissions
  );

  const {
    status: groupClientsStatus,
    data: groupClients,
    error: groupClientsError,
  } = useGet<Client[]>(`${tenantId}/groups/${groupId}/clients`, [
    `${tenantId}/groups/${groupId}/clients`,
  ]);

  // Fetch open loans
  const {
    status: openLoanStatus,
    data: openLoans,
    error: openLoansError,
  } = useGet<Loan[]>(
    `${tenantId}/groups/${groupId}/loans?filter={"where":{"loanStatusEnum":{"neq":"REJECTED"}},"order":["id DESC"]}`,
    [
      `${tenantId}/groups/${groupId}/loans?filter={"where":{"loanStatusEnum":{"neq":"REJECTED"}},"order":["id DESC"]}`,
    ]
  );

  // Fetch closed loans
  const {
    status: closedLoanStatus,
    data: closedLoans,
    error: closedLoansError,
  } = useGet<Loan[]>(
    `${tenantId}/groups/${groupId}/loans?filter={"where":{"loanStatusEnum":"REJECTED"}}`,
    [
      `${tenantId}/groups/${groupId}/loans?filter={"where":{"loanStatusEnum":"REJECTED"}}`,
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
    `${tenantId}/groups/${groupId}/savings-accounts?filter={"where":{"statusEnum":{"neq":"CLOSED"}},"order":["accountNo DESC"]}`,
    [
      `${tenantId}/groups/${groupId}/savings-accounts?filter={"where":{"statusEnum":{"neq":"CLOSED"}},"order":["accountNo DESC"]}`,
    ]
  );

  // Fetch closed savings
  const {
    status: closedSavingsStatus,
    data: closedSavings,
    error: closedSavingsError,
  } = useGet<SavingsAccount[]>(
    `${tenantId}/groups/${groupId}/savings-accounts?filter={"where":{"statusEnum":"CLOSED"}}`,
    [
      `${tenantId}/groups/${groupId}/savings-accounts?filter={"where":{"statusEnum":"CLOSED"}}`,
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
    `${tenantId}/groups/${groupId}/share-accounts?filter={"where":{"statusEnum":{"neq":"CLOSED"}},"order":["accountNo DESC"]}`,
    [
      `${tenantId}/groups/${groupId}/share-accounts?filter={"where":{"statusEnum":{"neq":"CLOSED"}},"order":["accountNo DESC"]}`,
    ]
  );

  // Fetch closed shares
  const {
    status: closedSharesStatus,
    data: closedShares,
    error: closedSharesError,
  } = useGet<ShareAccount[]>(
    `${tenantId}/groups/${groupId}/share-accounts?filter={"where":{"statusEnum":"CLOSED"}}`,
    [
      `${tenantId}/groups/${groupId}/share-accounts?filter={"where":{"statusEnum":"CLOSED"}}`,
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
      {group?.statusEnum !== "REJECTED" &&
      group?.statusEnum !== "WITHDRAWN" &&
      group?.statusEnum !== "CLOSED" ? (
        <>
          <div className="border-solid border-2 p-2 border-gray-200">
            <div className="flex justify-between items-center">
              <Title level={5}>Members</Title>

              <div className="flex justify-end gap-2">
                {canAssociateClientsGroups ? (
                  <>
                    <CreateModal
                      pageTitle={""}
                      buttonTitle="Transfer Clients"
                      isModalOpen={isMemberModalOpen}
                      setIsModalOpen={setIsMemberModalOpen}
                      width={1000}
                      icon={<UserSwitchOutlined />}
                      size="small"
                      CreateForm={
                        <TransferClientForm
                          setIsModalOpen={setIsClientModalOpen}
                          officeId={Number(group?.officeId)}
                          groupId={Number(groupId)}
                        />
                      }
                    />

                    <Link
                      href={`${groupId}/members?officeId=${group?.officeId}`}
                    >
                      <Button size="small" icon={<UsergroupAddOutlined />}>
                        Manage Members
                      </Button>
                    </Link>
                  </>
                ) : null}

                {canReadClients ? (
                  <CreateModal
                    pageTitle={"Client"}
                    buttonTitle="Add Client"
                    isModalOpen={isClientModalOpen}
                    setIsModalOpen={setIsClientModalOpen}
                    width={1000}
                    size="small"
                    CreateForm={
                      canCreateClients ? (
                        <CreateForm
                          setIsModalOpen={setIsClientModalOpen}
                          officeId={group?.officeId}
                          groupId={Number(groupId)}
                        />
                      ) : (
                        <div />
                      )
                    }
                  />
                ) : null}
              </div>
            </div>

            {groupClientsStatus === "error" ? (
              <Alert_
                message={"Error"}
                description={groupClientsError}
                type={"error"}
              />
            ) : (
              <>
                {groupClients && groupClients.length > 0 ? (
                  canReadClients ? (
                    <ClientsDataTable
                      data={groupClients}
                      loading={false}
                      group={true}
                    />
                  ) : (
                    <AccessDenied />
                  )
                ) : null}
              </>
            )}
          </div>

          <div className="mt-3 border-solid border-2 p-2 border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <Title level={5}>Loan Accounts</Title>
              <MyButton
                size="small"
                type={viewClosedAccounts ? "green" : "gray"}
                onClick={showClosedAccounts}
              >
                {viewClosedAccounts
                  ? "View Open Accounts"
                  : "View Closed Accounts"}
              </MyButton>
            </div>
            {loans && loans.length > 0 && (
              <LoansDataTable
                type="group"
                data={loans}
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
                type="group"
                data={savings}
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
                type="group"
                loading={
                  openSharesStatus === "pending" ||
                  closedSharesStatus === "pending"
                }
              />
            )}
          </div>
        </>
      ) : (
        <Title>{group?.statusEnum}</Title>
      )}
    </>
  );
}
