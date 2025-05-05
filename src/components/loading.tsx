import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";

export default function Loading(props: {
  config?: { size: "small" | "large" | "default" };
}) {
  const { config } = props;
  return (
    <Spin
      className="flex justify-center"
      size={config?.size}
      indicator={<LoadingOutlined spin />}
    />
  );
}
