"use client";
import React, { ReactElement } from "react";
import { EditOutlined } from "@ant-design/icons";
import DeleteModal from "./delete.modal";
import CreateModal from "./create.modal";

interface RecordActionsProps {
  actionTitle: string;
  canUpdate?: boolean;
  canDelete?: boolean;
  id: string | number;
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  updateForm?: ReactElement<{ setIsModalOpen?: (open: boolean) => void }>;
  deleteUrl?: string;
  queryKey?: string[];
  redirectUrl: string;
  modalWidth?: number;
}

const RecordActions: React.FC<RecordActionsProps> = ({
  actionTitle,
  canUpdate,
  canDelete,
  id,
  isModalOpen,
  setIsModalOpen,
  updateForm,
  queryKey,
  deleteUrl,
  redirectUrl,
  modalWidth,
}) => {
  return (
    <div className="flex gap-3 justify-end text-right">
      {canUpdate && updateForm && (
        <CreateModal
          pageTitle={actionTitle}
          submitType="update"
          buttonType="green"
          isModalOpen={isModalOpen}
          icon={<EditOutlined />}
          setIsModalOpen={setIsModalOpen}
          CreateForm={updateForm}
          width={modalWidth}
        />
      )}
      {canDelete && deleteUrl && (
        <DeleteModal
          url={deleteUrl}
          id={Number(id)}
          iconOnly={false}
          redirect={true}
          queryKey={queryKey}
          redirectUrl={redirectUrl}
          pageTitle={actionTitle}
        />
      )}
    </div>
  );
};

export default RecordActions;
