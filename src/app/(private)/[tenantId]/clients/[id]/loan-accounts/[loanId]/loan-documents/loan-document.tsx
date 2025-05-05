import { useCreate, useCreateV3, useGet } from "@/api";
import Alert_ from "@/components/alert";
import DataTable from "./loan-document.data-table";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Button, Modal } from "antd";
import toast from "@/utils/toast";
import { UploadOutlined } from "@ant-design/icons";
import MyButton from "@/components/my-button";

export default function LoanDocument() {
  const { tenantId, id, loanId } = useParams();

  const [isModal1Visible, setIsModal1Visible] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [clientId, setClientId] = useState(id);
  const [picture, setPicture] = useState<File | null>(null);

  const handleOk1 = () => {
    setIsModal1Visible(false);
  };

  const handleCancel1 = () => {
    setIsModal1Visible(false);
  };

  const filterParam = encodeURIComponent(
    JSON.stringify({
      where: { parentEntityId: loanId, parentEntityType: "loans" },
    })
  );

  let {
    status,
    data: documents,
    error,
  } = useGet<Document[]>(`${tenantId}/documents?filter=${filterParam}`, [
    `${tenantId}/documents/${loanId}`,
  ]);

  const { mutate: insertDocument } = useCreateV3(`${tenantId}/files`, [
    `${tenantId}/documents/${loanId}`,
  ]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPicture(e.target.files[0]);
    }
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    setIsUploading(true);
    if (!picture) {
      alert("Please provide document!");
      return;
    }

    const formData = new FormData();
    formData.append("loanId", `${loanId}`);
    formData.append("document", picture);

    insertDocument(formData, {
      onSuccess: () => {
        toast({ type: "success", response: "Uploaded Document Successfully" });
      },
      onError(error, variables, context) {
        toast({ type: "error", response: error });
      },
      onSettled: () => {
        setIsUploading(false);
      },
    });
  };

  const showModal = () => {
    setIsModal1Visible(true);
  };

  return (
    <>
      <div className="flex justify-end mb-5">
        <Button type="primary" icon={<UploadOutlined />} onClick={showModal}>
          Upload Document
        </Button>
        <Modal
          title={"Upload Document"}
          open={isModal1Visible}
          onOk={handleOk1}
          onCancel={handleCancel1}
          footer={null}
        >
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <input
              type="hidden"
              name="loanId"
              value={loanId}
              onChange={(e) => setClientId(e.target.value)}
            />

            <div>
              <input
                type="file"
                id="image"
                name="image"
                onChange={handleFileChange}
                required
                accept=".pdf"
              />
            </div>
            <div className="mt-5">
              <MyButton
                htmlType="submit"
                type="primary"
                loading={isUploading}
                icon={<UploadOutlined />}
              >
                Upload
              </MyButton>
            </div>
          </form>
        </Modal>
      </div>
      {status === "error" ? (
        <Alert_ message={"Error"} description={error?.message} type={"error"} />
      ) : (
        <DataTable
          data={documents}
          status={status === "pending" ? true : false}
        />
      )}
    </>
  );
}
