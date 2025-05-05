"use client";
import { useCreateV2, usePatchV2 } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { Form, Input, Select } from "antd";
import { useState, useEffect } from "react";
import { SubmitType } from "@/types";
import toast from "@/utils/toast";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import "./tiptap-editor.css";

export default function SupportForm(props: {
  tenantId: string | string[];
  submitType?: SubmitType;
  id?: number;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { submitType = "create", id, tenantId, setIsModalOpen } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);
  const [description, setDescription] = useState("");

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    onUpdate({ editor }) {
      const html = editor.getHTML();

      if (form.getFieldValue("description") !== html) {
        form.setFieldValue("description", html);
      }

      if (description !== html) {
        setDescription(html);
      }
    },
  });

  useEffect(() => {
    return () => {
      if (editor) {
        editor.destroy();
      }
    };
  }, [editor]);

  const { mutate: createSupportTicket } = useCreateV2(
    `${tenantId}/support-tickets`,
    [
      `${tenantId}/support-tickets/count/total`,
      `${tenantId}/support-tickets/count/open`,
      `${tenantId}/support-tickets/count/inProgress`,
      `${tenantId}/support-tickets/count/resolved`,
      `${tenantId}/support-tickets/count/closed`,
      `${tenantId}/support-tickets`,
      `${tenantId}/support-tickets/count/issue`,
      `${tenantId}/support-tickets/count/feedback`,
      `${tenantId}/support-tickets/count/question`,
      `${tenantId}/support-tickets/count/feature_request`,
    ]
  );

  const { mutate: updateSupportTicket } = usePatchV2(
    `${tenantId}/support-tickets`,
    id,
    [
      `${tenantId}/support-tickets/count/total`,
      `${tenantId}/support-tickets/count/open`,
      `${tenantId}/support-tickets/count/inProgress`,
      `${tenantId}/support-tickets/count/resolved`,
      `${tenantId}/support-tickets/count/closed`,
      `${tenantId}/support-tickets`,
      `${tenantId}/support-tickets/count/issue`,
      `${tenantId}/support-tickets/count/feedback`,
      `${tenantId}/support-tickets/count/question`,
      `${tenantId}/support-tickets/count/feature_request`,
    ]
  );

  const onReset = () => {
    form.resetFields();
    setDescription("");
    if (editor) {
      editor.commands.clearContent();
    }
  };

  const handleSubmit = (values: unknown) => {
    setSubmitLoader(true);
    const submitTypeMessage = submitType === "create" ? "created" : "updated";
    const requestData = {
      ...(values as Record<string, unknown>),
      description,
      url: window.location.href,
    };

    const callback = {
      onSuccess: () => {
        setSubmitLoader(false);
        toast({
          type: "success",
          response: `Support ticket ${submitTypeMessage} successfully.`,
        });
        onReset();
        setIsModalOpen(false);
      },
      onError: (error: unknown) => {
        const errorMessage =
          typeof error === "string"
            ? error
            : (
                error as {
                  response?: { data?: { error?: { message?: string } } };
                }
              )?.response?.data?.error?.message || "An unknown error occurred.";
        toast({ type: "error", response: errorMessage });
        setSubmitLoader(false);
      },
    };

    if (submitType === "create") {
      createSupportTicket(requestData, callback);
    } else {
      updateSupportTicket(requestData, callback);
    }
  };

  return (
    <Form
      layout="vertical"
      form={form}
      name="support"
      onFinish={handleSubmit}
      className="grid grid-cols-2 gap-4"
    >
      <Form.Item
        className="col-span-1"
        name="type"
        label="Type"
        rules={[{ required: true, message: "Type is required!" }]}
      >
        <Select
          options={[
            { value: "issue", label: "Issue" },
            { value: "feedback", label: "Feedback" },
            { value: "question", label: "Question" },
            { value: "feature_request", label: "Feature Request" },
          ]}
        />
      </Form.Item>

      <Form.Item
        className="col-span-1"
        name="priority"
        label="Priority"
        rules={[{ required: true, message: "Priority is required!" }]}
      >
        <Select
          options={[
            { value: "low", label: "Low" },
            { value: "medium", label: "Medium" },
            { value: "high", label: "High" },
            { value: "critical", label: "Critical" },
          ]}
        />
      </Form.Item>

      <Form.Item
        className="col-span-2"
        name="title"
        label="Title"
        rules={[
          { required: true },
          { max: 50, message: "Title must be less than 50 characters!" },
        ]}
      >
        <Input placeholder="Brief summary of your support request" />
      </Form.Item>

      <Form.Item
        name="description"
        className="col-span-2"
        label="Description"
        rules={[
          {
            validator: (_, value) => {
              if (value && value.replace(/<(.|\n)*?>/g, "").trim() !== "") {
                return Promise.resolve();
              }
              return Promise.reject("Description is required!");
            },
          },
        ]}
      >
        <div className="border border-gray-300 rounded-md p-2 min-h-[150px]">
          <EditorContent editor={editor} />
        </div>
      </Form.Item>

      <div className="col-span-2">
        <FormSubmitButtons
          submitLoader={submitLoader}
          onReset={onReset}
          submitText={
            submitType === "create" ? "Submit Ticket" : "Update Ticket"
          }
        />
      </div>
    </Form>
  );
}
