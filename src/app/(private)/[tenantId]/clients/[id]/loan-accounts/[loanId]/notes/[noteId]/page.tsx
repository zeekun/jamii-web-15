"use client";
import { useGetById } from "@/api";
import RecordActions from "@/components/record-actions";
import { Note } from "@/types";
import { Skeleton, Typography } from "antd";
import { useParams } from "next/navigation";
import { useState } from "react";
import { hasPermission } from "@/utils/permissions";
import { useRoles } from "@/providers/RolesProvider";
import Alert_ from "@/components/alert";
import { formattedDate } from "@/utils/dates";

const { Title } = Typography;

const readPermissions = [
  "READ_LOANNOTE",
  "ALL_FUNCTIONS",
  "ALL_FUNCTIONS_READ",
];
const deletePermissions = ["DELETE_LOANNOTE", "ALL_FUNCTIONS"];

export default function Page() {
  const { tenantId, id, loanId, noteId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    permissions,
    error: permissionsError,
    isPermissionsLoading,
  } = useRoles();
  const canRead = hasPermission(permissions, readPermissions);
  const canDelete = hasPermission(permissions, deletePermissions);

  const {
    status: noteStatus,
    data: note,
    error: noteError,
  } = useGetById<Note>(`${tenantId}/notes/`, `${noteId}`);

  if (noteStatus === "pending" || isPermissionsLoading) return <Skeleton />;

  if (noteError)
    return <Alert_ message="Error" description={noteError} type="error" />;
  if (permissionsError)
    return (
      <Alert_ message="Error" description={permissionsError} type="error" />
    );

  return (
    <>
      <div className="flex justify-between">
        <Title level={4}>Note #{note.id}</Title>
        <RecordActions
          actionTitle="note"
          isModalOpen={isModalOpen}
          redirectUrl={`/${tenantId}/clients/${id}/loan-accounts/${loanId}`}
          setIsModalOpen={setIsModalOpen}
          canDelete={canDelete}
          id={Number(noteId)}
          deleteUrl={`${tenantId}/notes`}
          queryKey={[`${tenantId}/notes/`, `${noteId}`]}
        />
      </div>

      <div className="w-full">
        <table className="text-md text-left w-full capitalize">
          <tbody>
            <tr className="mb-10">
              <td className="border-l-2 border-gray-200 p-4" colSpan={2}>
                {note?.note}
              </td>
            </tr>
            <tr>
              <th className="w-[10%]">Created By:</th>
              <td>
                {note.createdBy.person.firstName}{" "}
                {note.createdBy.person.middleName || " "}{" "}
                {note.createdBy.person.lastName}
              </td>
            </tr>
            <tr>
              <th className="w-[10%]">Created At:</th>
              <td>{formattedDate(note.createdAt, "HH:mm:ss A DD MMM YYYY")}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
