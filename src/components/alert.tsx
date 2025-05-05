import { Alert, Space } from "antd";

const Alert_ = (props: {
  message: string;
  description?: unknown;
  type?: "success" | "info" | "warning" | "error" | undefined;
}) => {
  const { message, description, type } = props;

  const descriptionFormatted =
    typeof description === "string"
      ? description
      : (description as { response: { data: { error: { message: string } } } })
          .response.data.error.message;

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <Alert
        message={`${message} ${
          typeof description === "object" &&
          description !== null &&
          "response" in description &&
          typeof (
            description as {
              response: { data: { error: { statusCode: number } } };
            }
          ).response?.data?.error?.statusCode === "number"
            ? (
                description as {
                  response: { data: { error: { statusCode: number } } };
                }
              ).response.data.error.statusCode
            : ""
        }`}
        description={descriptionFormatted}
        type={type}
      />
    </Space>
  );
};

export default Alert_;
