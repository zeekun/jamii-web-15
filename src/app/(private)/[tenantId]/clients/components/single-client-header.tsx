import MyButton from "@/components/my-button";
import { Client } from "@/types";
import { hasPermission } from "@/utils/permissions";
import {
  DeleteOutlined,
  UploadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Modal } from "antd";
import {
  createClientImagePermissions,
  deleteClientImagePermissions,
} from "../constants";

export default function SingleClientHeader(props: {
  client: Client;
  showModal1: any;
  showModal2: any;
  isModal1Visible: any;
  handleOk1: any;
  handleCancel1: any;
  isModal2Visible: any;
  handleOk2: any;
  handleCancel2: any;
  handleSubmit: any;
  clientId: any;
  setClientId: any;
  handleFileChange: any;
  onDelete: any;
  id: any;
  permissions: string[];
}) {
  const {
    client,
    showModal1,
    showModal2,
    isModal1Visible,
    handleOk1,
    handleCancel1,
    isModal2Visible,
    handleOk2,
    handleCancel2,
    handleSubmit,
    clientId,
    setClientId,
    handleFileChange,
    onDelete,
    id,
    permissions,
  } = props;

  const canCreateClientImage = hasPermission(
    permissions,
    createClientImagePermissions
  );

  const canDeleteClientImage = hasPermission(
    permissions,
    deleteClientImagePermissions
  );

  return (
    <div>
      <Avatar
        size={150}
        shape="square"
        className="shadow-md border border-gray-300"
        icon={<UserOutlined />}
        src={`${process.env.NEXT_PUBLIC_API_FILE_SERVER_BASE_URL}uploads/${client.image?.originalname}`}
      />

      <div className="flex gap-3 justify-center mt-[-1.8rem]">
        {canCreateClientImage && (
          <MyButton
            size="small"
            type="primary"
            icon={<UploadOutlined />}
            onClick={showModal1}
          />
        )}
        {canDeleteClientImage && (
          <MyButton
            type="danger"
            danger
            onClick={showModal2}
            size="small"
            icon={<DeleteOutlined />}
          />
        )}
      </div>

      <div className="flex gap-3 justify-center mt-[-1.8rem]">
        <Modal
          title="Upload Profile Picture"
          open={isModal1Visible}
          onOk={handleOk1}
          onCancel={handleCancel1}
          footer={null}
        >
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
            encType="multipart/form-data"
          >
            <input
              type="hidden"
              name="clientId"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
            />

            <div className="flex flex-col">
              <label
                htmlFor="image"
                className="text-sm font-medium text-gray-700"
              >
                Choose Image
              </label>
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleFileChange}
                required
                className="border p-2 rounded-md"
              />
            </div>

            <div className="flex justify-end">
              <MyButton
                htmlType="submit"
                type="primary"
                icon={<UploadOutlined />}
              >
                Upload
              </MyButton>
            </div>
          </form>
        </Modal>

        <Modal
          title="Delete Image"
          open={isModal2Visible}
          onOk={handleOk2}
          onCancel={handleCancel2}
          footer={null}
        >
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete the profile image?
          </p>
          <div className="flex justify-end gap-3">
            <MyButton type="default" onClick={handleCancel2}>
              Cancel
            </MyButton>
            <MyButton type="primary" danger onClick={() => onDelete(id)}>
              Delete
            </MyButton>
          </div>
        </Modal>
      </div>
    </div>
  );
}
