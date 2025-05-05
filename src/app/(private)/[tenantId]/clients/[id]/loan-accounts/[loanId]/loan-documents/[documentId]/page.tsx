"use client";
import { useGetById } from "@/api";
import RecordActions from "@/components/record-actions";
import { Document } from "@/types";
import { Skeleton, Typography, Button } from "antd";
import { useParams } from "next/navigation";
import { useState } from "react";
import { hasPermission } from "@/utils/permissions";
import { useRoles } from "@/providers/RolesProvider";
import Alert_ from "@/components/alert";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import "@cyntler/react-doc-viewer/dist/index.css";

import {
  FilePdfOutlined,
  FileImageOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  DownloadOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

const readPermissions = [
  "READ_DOCUMENT",
  "ALL_FUNCTIONS",
  "ALL_FUNCTIONS_READ",
];
const deletePermissions = ["DELETE_DOCUMENT", "ALL_FUNCTIONS"];

export default function Page() {
  const { tenantId, id, loanId, documentId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    permissions,
    error: permissionsError,
    isPermissionsLoading,
  } = useRoles();
  const canRead = hasPermission(permissions, readPermissions);
  const canDelete = hasPermission(permissions, deletePermissions);

  const {
    status: documentStatus,
    data: document,
    error: documentError,
  } = useGetById<Document>(`${tenantId}/documents/`, `${documentId}`);

  if (documentStatus === "pending" || isPermissionsLoading) return <Skeleton />;

  if (documentError)
    return <Alert_ message="Error" description={documentError} type="error" />;
  if (permissionsError)
    return (
      <Alert_ message="Error" description={permissionsError} type="error" />
    );

  const fileType = document?.type || "";
  const fileUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}uploads/${document?.location}`;

  // Prepare documents for DocViewer
  const docs = [{ uri: fileUrl, fileType }];
  console.log(fileUrl);

  const supportedFileTypes = ["pdf", "png", "docx"];
  const getFileType = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    return supportedFileTypes.includes(extension!) ? extension : "default";
  };

  return (
    <>
      <div className="flex justify-between">
        <Title level={4}>Document</Title>
        <RecordActions
          actionTitle="document"
          isModalOpen={isModalOpen}
          redirectUrl={`/${tenantId}/clients/${id}/loan-accounts/${loanId}`}
          setIsModalOpen={setIsModalOpen}
          canDelete={canDelete}
          id={Number(documentId)}
          deleteUrl={`${tenantId}/documents`}
          queryKey={[`${tenantId}/documents/`, `${documentId}`]}
        />
      </div>

      <div className="w-full">
        <table className="text-md text-left w-full capitalize">
          <tbody>
            <tr className="text-lg">
              <th>Name:</th>
              <td>{document?.name}</td>
            </tr>
          </tbody>
        </table>

        <div className="mt-4">
          {fileType.includes("word") && (
            <DocViewer
              documents={[{ uri: fileUrl, fileType: getFileType(fileUrl) }]}
              pluginRenderers={DocViewerRenderers}
            />
          )}

          {fileType.includes("pdf") && (
            <iframe src={fileUrl} width="100%" height="600px"></iframe>
          )}

          {fileType.includes("image") && (
            <img
              src={fileUrl}
              alt={document?.name}
              className="max-w-full h-auto"
            />
          )}
        </div>
      </div>
    </>
  );
}
