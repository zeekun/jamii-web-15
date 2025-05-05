"use client";
import { SubmitType } from "@/types";
import { PlusOutlined } from "@ant-design/icons";
import { Button, Modal } from "antd";
import pluralize from "pluralize";
import { useState } from "react";
import { PAGE_TITLE } from "./constants";
import CreateForm from "./create.form";

const CreateModal = (props: { submitType: SubmitType }) => {
  const { submitType } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [open, setOpen] = useState(false);

  const showModal = () => {
    setOpen(true);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <>
      <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
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
        open={open}
        onCancel={handleCancel}
        footer={null}
        width={1200}
      >
        {/* <Create submitType="create" handleCancel={handleCancel} /> */}

        <CreateForm setIsModalOpen={setIsModalOpen} />
      </Modal>
    </>
  );
};

export default CreateModal;
