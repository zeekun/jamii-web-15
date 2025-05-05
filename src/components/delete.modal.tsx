import { useDelete } from "@/api";
import toast from "@/utils/toast";
import {
  DeleteFilled,
  DeleteOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { Popconfirm } from "antd";
import { useState } from "react";
import MyButton from "./my-button";
import { useRouter } from "next/navigation";
import _ from "lodash";

export default function DeleteModal(props: {
  pageTitle?: string;
  url: string;
  id: number;
  queryKey?: string[];
  iconOnly?: boolean;
  redirect?: boolean;
  redirectUrl?: string;
}) {
  const {
    pageTitle = "Item",
    url,
    id,
    queryKey,
    iconOnly = true,
    redirect = false,
    redirectUrl,
  } = props;
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const router = useRouter();

  console.log(queryKey);

  const { mutate: deleteRow } = useDelete(url, queryKey ? queryKey : [url]);

  const showPopconfirm = () => {
    setOpen(true);
  };

  const handleOk = () => {
    setConfirmLoading(true);

    deleteRow(id, {
      onSuccess: () => {
        setOpen(false);
        setConfirmLoading(false);
        toast({
          type: "success",
          response: `${_.capitalize(pageTitle)} deleted successfully.`,
        });
        if (redirect) {
          if (redirectUrl) {
            router.push(redirectUrl);
          }
        }
      },
      onError(error) {
        setConfirmLoading(false);
        toast({
          type: "error",
          response: error.message,
        });
      },
    });
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <Popconfirm
      title="Delete"
      icon={<QuestionCircleOutlined style={{ color: "red" }} />}
      description="This task can not be reversed"
      open={open}
      placement="bottomRight"
      onConfirm={handleOk}
      okButtonProps={{ loading: confirmLoading }}
      onCancel={handleCancel}
    >
      {iconOnly ? (
        <DeleteFilled
          style={{ color: "red" }}
          onClick={showPopconfirm}
          title="Delete"
        />
      ) : (
        <MyButton
          type="danger"
          icon={<DeleteOutlined />}
          onClick={showPopconfirm}
        >
          Delete
        </MyButton>
      )}
    </Popconfirm>
  );
}
