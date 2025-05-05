import { PageLinkType } from "@/types";
import { Typography } from "antd";
import Link from "next/link";

const { Title } = Typography;

export default function PageLink(props: PageLinkType) {
  const { icon, title, description, link } = props;

  return (
    <li className="hover:bg-gray-100 p-2 hover:cursor-pointer border-b-2 border-b-gray-200">
      <Link href={`${link} `} className="text-black block hover:text-black">
        <div className="flex items-top gap-2">
          <div>{icon}</div>
          <div>
            <Title level={5}>{title}</Title>
          </div>
        </div>
        {description}
      </Link>
    </li>
  );
}
