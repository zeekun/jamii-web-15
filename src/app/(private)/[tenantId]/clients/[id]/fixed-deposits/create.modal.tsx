"use client";
import { PlusOutlined } from "@ant-design/icons";
import { Button, Modal } from "antd";
import pluralize from "pluralize";
import { useState } from "react";
import CreateForm from "./create.form";
import { Client, SubmitType } from "@/types";
import { PAGE_TITLE } from "./constants";

export default function FixedDepositCreateModal(props: {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isModalOpen: boolean;
  submitType: SubmitType;
  depositType?: "RECURRING DEPOSIT";
}) {
  const { submitType, depositType, setIsModalOpen, isModalOpen } = props;

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
        className="w-full flex justify-start items-center"
        icon={<PlusOutlined />}
        onClick={showModal}
      >
        <span className="capitalize">
          {submitType} {!depositType ? PAGE_TITLE : "Recurring Deposit"}
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
        width={1200}
      >
        <CreateForm setIsModalOpen={setIsModalOpen} />
      </Modal>
    </>
  );
}
