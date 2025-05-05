import { useCreate, useGet } from "@/api";
import Alert_ from "@/components/alert";
import DataTable from "./notes.data-table";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Button, Form, Input, Modal } from "antd";
import toast from "@/utils/toast";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { PlusOutlined } from "@ant-design/icons";

export default function Note() {
  const { tenantId, id, loanId } = useParams();
  const [isModal1Visible, setIsModal1Visible] = useState(false);
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);
  const handleOk1 = () => {
    setIsModal1Visible(false);
  };

  const handleCancel1 = () => {
    setIsModal1Visible(false);
  };

  let {
    status,
    data: notes,
    error,
  } = useGet<Document[]>(`${tenantId}/loans/${loanId}/notes`, [
    `${tenantId}/loans/${loanId}/notes`,
  ]);

  const { mutate: insertNote } = useCreate(
    `${tenantId}/loans/${loanId}/notes`,
    [`${tenantId}/loans/${loanId}/notes`]
  );

  const onReset = () => {
    form.resetFields();
  };

  const showModal = () => {
    setIsModal1Visible(true);
  };

  function onFinish(values: any) {
    setSubmitLoader(true);

    insertNote(
      { noteTypeEnum: "LOAN", ...values },
      {
        onSuccess: () => {
          setSubmitLoader(false);
        },
        onError(error, variables, context) {
          setSubmitLoader(false);
        },
      }
    );
  }

  return (
    <>
      <div className="flex justify-end mb-5">
        <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
          Add Note
        </Button>
        <Modal
          title={"Add Note"}
          open={isModal1Visible}
          onOk={handleOk1}
          onCancel={handleCancel1}
          footer={null}
        >
          <Form
            layout="vertical"
            form={form}
            name={"notes"}
            onFinish={onFinish}
            className="grid grid-cols-2 gap-2"
          >
            <Form.Item
              className="col-span-2"
              name="note"
              label="Note"
              rules={[{ required: true, message: "Note is required!" }]}
            >
              <Input.TextArea rows={5} />
            </Form.Item>

            <div className="col-span-2">
              <FormSubmitButtons
                submitLoader={submitLoader}
                onReset={onReset}
              />
            </div>
          </Form>
        </Modal>
      </div>
      {status === "error" ? (
        <Alert_ message={"Error"} description={error?.message} type={"error"} />
      ) : (
        <DataTable data={notes} status={status === "pending" ? true : false} />
      )}
    </>
  );
}
