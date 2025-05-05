"use client";
import { SubmitType } from "@/types";
import { PlusOutlined } from "@ant-design/icons";
import { Button, Modal, ModalProps } from "antd";
import pluralize from "pluralize";
import React, { ReactElement, MouseEvent } from "react";
import MyButton from "./my-button";
import { SizeType } from "antd/es/config-provider/SizeContext";

type ButtonType =
  | "text"
  | "link"
  | "default"
  | "primary"
  | "dashed"
  | "danger"
  | "gray"
  | "green"
  | "warning";

interface CreateModalProps {
  pageTitle: string;
  CreateForm: ReactElement<{ setIsModalOpen?: (open: boolean) => void }>;
  submitType?: SubmitType;
  text?: boolean;
  icon?: ReactElement<{ onClick?: (e: MouseEvent) => void }>;
  iconOnly?: boolean;
  size?: SizeType;
  width?: number;
  buttonTitle?: string;
  buttonWidth?: string | boolean;
  className?: string;
  buttonType?: ButtonType;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  modalProps?: Omit<ModalProps, "open" | "onCancel" | "footer" | "width">;
}

const CreateModal: React.FC<CreateModalProps> = ({
  pageTitle,
  CreateForm,
  submitType = "create",
  text = true,
  iconOnly = true,
  buttonWidth,
  icon,
  width = 600,
  buttonTitle,
  className,
  buttonType = submitType === "create" ? "primary" : "default",
  size,
  isModalOpen,
  setIsModalOpen,
  modalProps = {},
}) => {
  const buttonText = buttonTitle || `${submitType} ${pageTitle}`;
  const modalTitle =
    buttonTitle || `${submitType} ${pluralize.singular(pageTitle)}`;

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const renderButton = () => {
    if (text) {
      return (
        <MyButton
          className={className}
          size={size}
          type={buttonType}
          icon={submitType === "create" ? <PlusOutlined /> : icon}
          onClick={() => setIsModalOpen(true)}
        >
          <span className="capitalize">{buttonText}</span>
        </MyButton>
      );
    }

    if (iconOnly && icon) {
      return React.cloneElement(icon, {
        onClick: (e: MouseEvent) => {
          icon.props.onClick?.(e);
          setIsModalOpen(true);
        },
      });
    }

    return (
      <Button
        size={size}
        className={`${buttonWidth === true ? "w-full" : ""} text-left`}
        type="default"
        icon={icon}
        onClick={() => setIsModalOpen(true)}
      >
        <span className="capitalize">{buttonText}</span>
      </Button>
    );
  };

  return (
    <div>
      {renderButton()}
      <Modal
        title={<h1 className="capitalize">{modalTitle}</h1>}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={width}
        {...modalProps}
      >
        {React.cloneElement(CreateForm, {
          setIsModalOpen,
        })}
      </Modal>
    </div>
  );
};

export default CreateModal;
