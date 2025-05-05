"use client";
import PageHeader from "@/components/page-header";
import PageLink from "@/components/page-link";
import { PageLinkType } from "@/types";
import { HomeOutlined, SettingOutlined } from "@ant-design/icons";
import { Card } from "antd";
import { PAGE_TITLE } from "./constants";
import { useParams } from "next/navigation";

const TaxPage = () => {
  const { tenantId } = useParams();
  const PageLinksLeft: PageLinkType[] = [
    {
      icon: <HomeOutlined />,
      title: "Manage Tax Components",
      description: "Defined Tax Components",
      link: `/${tenantId}/products/manage-tax-configurations/tax-components`,
    },
  ];

  const PageLinksRight: PageLinkType[] = [
    {
      icon: <SettingOutlined />,
      title: "Manage Tax Groups",
      description: "Defines Tax Groups",
      link: `/${tenantId}/products/manage-tax-configurations/tax-groups`,
    },
  ];
  return (
    <>
      <PageHeader pageTitle={PAGE_TITLE} />
      <div className="grid grid-cols-2 gap-4">
        <Card className="">
          <ul>
            {PageLinksLeft.map((link, i) => (
              <PageLink
                key={i}
                icon={link.icon}
                title={link.title}
                description={link.description}
                link={link.link}
              />
            ))}
          </ul>
        </Card>
        <Card className="">
          <ul>
            {PageLinksRight.map((link, i) => (
              <PageLink
                key={i}
                icon={link.icon}
                title={link.title}
                description={link.description}
                link={link.link}
              />
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
};

export default TaxPage;
