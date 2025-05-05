import { CheckCircleFilled } from "@ant-design/icons";

export default function TableRowCheck(props: { check: boolean }) {
  const { check } = props;
  return check ? (
    <CheckCircleFilled className="text-green-500 w-4 h-4" />
  ) : (
    <CheckCircleFilled className="text-red-500 w-4 h-4" />
  );
}
