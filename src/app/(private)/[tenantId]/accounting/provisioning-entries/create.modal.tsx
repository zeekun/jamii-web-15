"use client";
import { SubmitType } from "@/types";
import { PlusOutlined } from "@ant-design/icons";
import { Button, Modal } from "antd";
import pluralize from "pluralize";
import { useState } from "react";
import { PAGE_TITLE } from "./constants";
import Create from "./create";

const CreateModal = (props: { submitType: SubmitType }) => {
  const { submitType } = props;
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
        width={600}
      >
        <Create submitType="create" handleCancel={handleCancel} />
      </Modal>
    </>
  );
};

export default CreateModal;
