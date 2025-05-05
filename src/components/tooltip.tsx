import { QuestionCircleOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
import { ReactNode } from "react";

export default function Tooltip_(props: {
  title: string;
  inputLabel?: string;
  icon?: ReactNode;
}) {
  const { title, inputLabel, icon } = props;
  return (
    <Tooltip title={title} className="capitalize">
      {inputLabel ? inputLabel : null}{" "}
      {icon ? (
        icon
      ) : (
        <QuestionCircleOutlined style={{ color: "rgba(0,0,0,.45)" }} />
      )}
    </Tooltip>
  );
}
