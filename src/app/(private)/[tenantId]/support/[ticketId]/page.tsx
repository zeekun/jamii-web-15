"use client";
import { useGet, useCreate, usePatchV2 } from "@/api";
import {
  Button,
  Card,
  Divider,
  Form,
  Select,
  Skeleton,
  Tag,
  Typography,
} from "antd";
import { useParams } from "next/navigation";
import {
  ClockCircleOutlined,
  UserOutlined,
  CheckCircleOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useState, useEffect } from "react";
import toast from "@/utils/toast";
const { Option } = Select;

// Extend dayjs with relativeTime plugin
dayjs.extend(relativeTime);

// Tiptap Editor imports
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import "../tiptap-editor.css"; // Make sure to create this CSS file

import {
  Employee,
  MySession,
  SupportTicket,
  SupportTicketReply,
} from "@/types";
import { useSession } from "next-auth/react";
import { filterOption } from "@/utils/strings";
import Alert_ from "@/components/alert";

const { Title, Text } = Typography;

export default function TicketPage() {
  const { tenantId, ticketId } = useParams();
  const { data: session } = useSession();
  const mySession = session as MySession | null;
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tiptap Editor for replies
  const replyEditor = useEditor({
    extensions: [StarterKit],
    content: "",
  });

  // Fetch ticket data
  const {
    data: ticket,
    status: ticketStatus,
    error: ticketError,
    refetch,
  } = useGet<SupportTicket>(`${tenantId}/support-tickets/${ticketId}`, [
    `${tenantId}/support-tickets/${ticketId}`,
  ]);

  // Fetch replies
  const { data: replies, refetch: refetchReplies } = useGet<
    SupportTicketReply[]
  >(`${tenantId}/support-tickets/${ticketId}/support-ticket-replies`, [
    `${tenantId}/support-tickets/${ticketId}/replies`,
  ]);

  // Fetch staff
  const { data: staff } = useGet<Employee[]>(`${tenantId}/staff`, [
    `${tenantId}/staff`,
  ]);

  // Update ticket status
  const { mutate: updateTicket } = usePatchV2(
    `${tenantId}/support-tickets`,
    `${ticketId}`,
    [
      `${tenantId}/support-tickets/${ticketId}`,
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
      `${tenantId}/support-tickets?filter={"order":["updatedAt DESC"],,"limit":3}`,
    ]
  );

  // Create reply
  const { mutate: createReply } = useCreate(
    `${tenantId}/support-tickets/${ticketId}/support-ticket-replies`,
    [`${tenantId}/support-tickets/${ticketId}/replies`]
  );

  const handleStatusChange = (newStatus: string) => {
    updateTicket(
      { status: newStatus },
      {
        onSuccess: () => {
          toast({
            type: "success",
            response: "Ticket status updated successfully",
          });
          refetch();
        },
        onError: (error) => {
          toast({ type: "error", response: error.message });
        },
      }
    );
  };

  const handleReplySubmit = () => {
    if (!replyEditor?.getHTML() || replyEditor?.getText().trim() === "") {
      toast({ type: "error", response: "Reply content cannot be empty" });
      return;
    }

    setIsSubmitting(true);
    createReply(
      { reply: replyEditor.getHTML() },
      {
        onSuccess: () => {
          toast({ type: "success", response: "Reply added successfully" });
          replyEditor?.commands.clearContent();
          refetchReplies();
          setIsSubmitting(false);
        },
        onError: (error) => {
          toast({ type: "error", response: error.message });
          setIsSubmitting(false);
        },
      }
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "blue";
      case "in_progress":
        return "orange";
      case "resolved":
        return "green";
      case "closed":
        return "gray";
      default:
        return "default";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "issue":
        return "red";
      case "feedback":
        return "purple";
      case "question":
        return "blue";
      case "feature_request":
        return "cyan";
      default:
        return "default";
    }
  };

  const handleAssignUser = async (userId: number) => {
    updateTicket(
      { assignedToId: userId },
      {
        onSuccess: () => {
          toast({
            type: "success",
            response: "Ticket assigned successfully",
          });
          refetch();
        },
        onError: (error) => {
          toast({ type: "error", response: error.message });
        },
      }
    );
  };

  useEffect(() => {
    return () => {
      replyEditor?.destroy();
    };
  }, [replyEditor]);

  if (ticketStatus === "error") {
    return <Alert_ message="Error" description={ticketError} type="error" />;
  }

  if (ticketStatus === "pending") {
    return <Skeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Ticket details card */}
      <Card className="bg-gray-50 shadow-sm border border-gray-200">
        <div className="space-y-4">
          {/* Title and type */}
          <div className="flex flex-col gap-2 md:flex-row md:justify-between md:items-start">
            <Title level={3}>{ticket.title}</Title>

            <div className="flex items-center gap-2 flex-wrap">
              <Text strong>Priority: </Text>
              <Tag
                color={
                  ticket.priority === "high"
                    ? "red"
                    : ticket.priority === "medium"
                    ? "orange"
                    : "green"
                }
              >
                {ticket.priority.toUpperCase()}
              </Tag>
              <Text strong>Type: </Text>
              <Tag color={getTypeColor(ticket.type)}>
                {ticket.type
                  .split("_")
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(" ")}
              </Tag>
              <Text strong>Status: </Text>
              <Tag color={getStatusColor(ticket.status)}>
                {ticket.status
                  .split("_")
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(" ")}
              </Tag>
            </div>
          </div>

          {/* Creator and time */}
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:space-x-4 text-gray-500 text-sm">
            <span>
              <UserOutlined /> {ticket.createdBy.person.firstName}{" "}
              {ticket.createdBy.person.middleName || ""}{" "}
              {ticket.createdBy.person.lastName}
            </span>
            <span>
              <ClockCircleOutlined />{" "}
              {dayjs(ticket.createdAt).format("MMMM D, YYYY [at] h:mm A")}
            </span>
          </div>

          <Divider />

          {/* Description */}
          <div className="bg-white p-4 rounded-md border border-gray-200">
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: ticket.description }}
            />
          </div>

          <Divider />

          {/* Priority, assignment, and actions */}
          <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
            {/* Assignment section */}
            <div className="flex items-center gap-2">
              <Text strong>Assigned To:</Text>
              {ticket.assignedTo ? (
                <Tag>
                  {ticket.assignedTo.firstName}{" "}
                  {ticket.assignedTo.middleName || ""}{" "}
                  {ticket.assignedTo.lastName}
                </Tag>
              ) : (
                <Tag color="orange">Unassigned</Tag>
              )}

              {ticket.createdBy.id !== Number(mySession?.user.id) && (
                <Select
                  placeholder="Assign to staff"
                  style={{ width: 200 }}
                  onChange={handleAssignUser}
                  allowClear
                  showSearch
                  size="small"
                  filterOption={filterOption}
                >
                  {staff?.map((staff) => (
                    <Option key={staff.id} value={staff.id}>
                      {staff.firstName} {staff.middleName || ""}{" "}
                      {staff.lastName}
                    </Option>
                  ))}
                </Select>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 items-center">
              <Text strong>Change Status:</Text>
              {ticket.status !== "open" && (
                <Button
                  icon={<ClockCircleOutlined />}
                  onClick={() => handleStatusChange("open")}
                  size="small"
                >
                  Reopen
                </Button>
              )}

              {Number(mySession?.user.userId) !== ticket.createdById ? (
                <>
                  {ticket.status !== "in_progress" && (
                    <Button
                      icon={<SyncOutlined />}
                      size="small"
                      onClick={() => handleStatusChange("in_progress")}
                    >
                      Mark In Progress
                    </Button>
                  )}
                </>
              ) : null}

              {ticket.status !== "resolved" && (
                <Button
                  icon={<CheckCircleOutlined />}
                  type="primary"
                  size="small"
                  onClick={() => handleStatusChange("resolved")}
                >
                  Resolve
                </Button>
              )}
              {ticket.status !== "closed" && (
                <Button
                  danger
                  onClick={() => handleStatusChange("closed")}
                  size="small"
                >
                  Close
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Replies section */}
      <Card
        title={`Replies (${replies?.length || 0})`}
        className="bg-white shadow-sm border border-gray-200"
      >
        {replies && replies?.length > 0 && (
          <div className="space-y-4">
            {replies.map((reply, idx) => (
              <div
                key={idx}
                className="bg-gray-50 rounded-md p-4 border border-gray-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 mb-2">
                  <Text strong>
                    {reply.createdBy.person.firstName}{" "}
                    {reply.createdBy.person.middleName || ""}{" "}
                    {reply.createdBy.person.lastName}
                  </Text>
                  <Text type="secondary" className="text-sm">
                    {dayjs(reply.createdAt).fromNow()}
                  </Text>
                </div>
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: reply.reply }}
                />
              </div>
            ))}
          </div>
        )}

        <Divider />

        {/* Reply Form */}
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
          <Form form={form} layout="vertical">
            <Form.Item label="Add Reply" required>
              <div className="border border-gray-300 rounded-md p-2 min-h-[150px]">
                <EditorContent editor={replyEditor} />
              </div>
            </Form.Item>
            <Button
              type="primary"
              onClick={handleReplySubmit}
              loading={isSubmitting}
            >
              Submit Reply
            </Button>
          </Form>
        </div>
      </Card>
    </div>
  );
}
