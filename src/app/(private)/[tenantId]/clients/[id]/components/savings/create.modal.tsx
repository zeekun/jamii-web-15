"use client";
import { PlusOutlined } from "@ant-design/icons";
import { Button, Modal } from "antd";
import pluralize from "pluralize";
import CreateForm from "./create-savings.form";
import { Client, Group, SubmitType } from "@/types";
import { PAGE_TITLE } from "./constants";

export default function SavingsCreateModal(props: {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isModalOpen: boolean;
  submitType: SubmitType;
  client: Client | Group | undefined;
}) {
  const { submitType, setIsModalOpen, isModalOpen, client } = props;

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button
        type="primary"
        className="w-full flex justify-start  items-center"
        icon={<PlusOutlined />}
        onClick={showModal}
      >
        <span className="capitalize">
          {submitType} {PAGE_TITLE}
        </span>
      </Button>
      <Modal
        title={
          <h1 className="capitalize">
            {submitType} {pluralize.singular(PAGE_TITLE)}
          </h1>
        }
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={1000}
      >
        <CreateForm setIsModalOpen={setIsModalOpen} client={client} />
      </Modal>
    </>
  );
}
