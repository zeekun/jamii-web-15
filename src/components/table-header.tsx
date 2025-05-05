import { MySession } from "@/types";
import { Input } from "antd";

export default function TableHeader(props: {
  setSearchedText: ((value: string) => void) | undefined;
  extra?: React.ReactNode;
  activeSession?: MySession | null;
}) {
  const { setSearchedText } = props;

  return (
    <div className="flex justify-between items-center mb-4">
      <Input.Search
        onSearch={(value) => {
          setSearchedText?.(value);
        }}
        onChange={(e) => {
          setSearchedText?.(e.target.value);
        }}
        placeholder="Search..."
        className="w-1/4"
      />

      <div>{props.extra}</div>
    </div>
  );
}
