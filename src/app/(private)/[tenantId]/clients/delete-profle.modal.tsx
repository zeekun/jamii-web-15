import { DeleteOutlined } from "@ant-design/icons";
import { Button, Modal } from "antd";
import { useState } from "react";

export default function DeleteProfileModal(props: {
  clientId: string | number;
}) {
  const { clientId } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <Button
        type="primary"
        size="small"
        onClick={showModal}
        icon={<DeleteOutlined />}
      />

      <Modal title={"Delete Picture"} open={isModalOpen} footer={null}>
        <div className="flex justify-end gap-4">
          <Button type="primary">Delete</Button>
          <Button type="default">Cancel</Button>
        </div>
      </Modal>
    </>
  );
}
