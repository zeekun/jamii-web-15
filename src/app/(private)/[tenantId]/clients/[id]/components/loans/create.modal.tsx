"use client";
import { PlusOutlined } from "@ant-design/icons";
import { Button, Modal } from "antd";
import pluralize from "pluralize";
import { useState } from "react";
import { PAGE_TITLE } from "./constants";
import CreateForm from "./create.form";
import { Client, Group, SubmitType } from "@/types";
import { useParams } from "next/navigation";

export default function LoanCreateModal(props: {
  submitType: SubmitType;
  client: Client | Group | undefined;
  jlg?: boolean;
}) {
  const { groupId } = useParams();
  const { submitType, client, jlg } = props;
  const [open, setOpen] = useState(false);

  const showModal = () => {
    setOpen(true);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <>
      <Button
        type="primary"
        className={`flex items-center ${
          jlg ? "justify-end" : "justify-start w-full"
        } `}
        icon={<PlusOutlined />}
        onClick={showModal}
      >
        <span className="capitalize">
          {submitType} {jlg ? `JLG ${PAGE_TITLE}` : PAGE_TITLE}
        </span>
      </Button>
      <Modal
        title={
          <h1 className="capitalize">
            {submitType}{" "}
            {pluralize.singular(jlg ? `JLG ${PAGE_TITLE}` : PAGE_TITLE)}
          </h1>
        }
        open={open}
        onCancel={handleCancel}
        footer={null}
        width={1200}
      >
        <CreateForm
          client={client}
          setIsModalOpen={setOpen}
          jlg={jlg}
          groupId={Number(groupId)}
        />
      </Modal>
    </>
  );
}
