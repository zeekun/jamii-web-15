"use client";
import { useGet } from "@/api";
import Alert_ from "@/components/alert";
import PageHeader from "@/components/page-header";
import { GlJournalEntry } from "@/types";
import { formattedDate } from "@/utils/dates";
import DataTable from "../data-table";
import CreateModal from "@/components/create.modal";
import CreateForm from "./create.form";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Skeleton } from "antd";
import { useRoles } from "@/providers/RolesProvider";
import { hasPermission } from "@/utils/permissions";
import AccessDenied from "@/components/access-denied";

const reversePermissions = ["REVERSE_JOURNALENTRY", "ALL_FUNCTIONS"];
const readPermissions = [
  "READ_JOURNALENTRY",
  "ALL_FUNCTIONS",
  "ALL_FUNCTIONS_READ",
];

export default function Page() {
  const { tenantId, id } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    status: glJournalEntriesStatus,
    data: glJournalEntries,
    error: glJournalEntriesError,
  } = useGet<GlJournalEntry[]>(
    `${tenantId}/gl-journal-entries`,
    [`${id}`],
    `?filter={"where":{"transactionId":"${id}"}}`
  );

  const {
    permissions,
    error: permissionsError,
    isPermissionsLoading,
  } = useRoles();

  const canReverse = hasPermission(permissions, reversePermissions);
  const canRead = hasPermission(permissions, readPermissions);

  if (glJournalEntriesStatus === "pending" || isPermissionsLoading) {
    return <Skeleton />;
  }

  if (permissionsError)
    return (
      <Alert_ message="Error" description={permissionsError} type="error" />
    );

  if (glJournalEntries?.length === 0) {
    return (
      <Alert_
        message="Error"
        description={"404 - Transaction not found"}
        type="error"
      />
    );
  }

  return (
    <>
      {canRead ? (
        <>
          {glJournalEntries && (
            <>
              <PageHeader
                pageTitle={`Transaction Number - ${glJournalEntries[0]?.transactionId}`}
                createModal={
                  canReverse &&
                  !glJournalEntries[0].reversed &&
                  glJournalEntries[0].manualEntry ? (
                    <CreateModal
                      pageTitle="Reverse"
                      submitType="create"
                      isModalOpen={isModalOpen}
                      setIsModalOpen={setIsModalOpen}
                      CreateForm={
                        <CreateForm
                          selectedTransactions={glJournalEntries}
                          setIsModalOpen={setIsModalOpen}
                        />
                      }
                    />
                  ) : glJournalEntries[0].reversed ? (
                    <span className="text-red-500 text-lg text-bold">
                      This transaction was reversed
                    </span>
                  ) : null
                }
              />

              <table className="text-left w-full mb-5">
                <tr>
                  <th>Office</th>
                  <td>{glJournalEntries[0].office.name}</td>
                  <th>Transaction Date</th>
                  <td>{formattedDate(glJournalEntries[0].entryDate)}</td>
                </tr>
                <tr>
                  <th>Created By</th>
                  <td>
                    {glJournalEntries[0].createdByUser.person.firstName}{" "}
                    {glJournalEntries[0].createdByUser.person.middleName ?? ""}{" "}
                    {glJournalEntries[0].createdByUser.person.lastName}
                  </td>
                  <th>Created On</th>
                  <td>{formattedDate(glJournalEntries[0].createdAt)}</td>
                </tr>
              </table>

              {glJournalEntriesStatus === "error" && (
                <Alert_
                  message="Error"
                  description={glJournalEntriesError}
                  type="error"
                />
              )}

              <DataTable
                data={glJournalEntries}
                transaction={true}
                loading={glJournalEntriesStatus === "success" ? false : true}
              />
            </>
          )}
        </>
      ) : (
        <AccessDenied />
      )}
    </>
  );
}
