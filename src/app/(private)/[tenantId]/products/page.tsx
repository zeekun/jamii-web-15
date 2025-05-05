"use client";
import PageHeader from "@/components/page-header";
import PageLink from "@/components/page-link";
import { MySession, PageLinkType } from "@/types";
import {
  BookOutlined,
  CalendarOutlined,
  HomeOutlined,
  LineChartOutlined,
  MoneyCollectOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Card } from "antd";
import { ENDPOINT, PAGE_TITLE } from "./constants";
import { useSession } from "next-auth/react";

const PageLinksLeft: PageLinkType[] = [
  {
    icon: <HomeOutlined />,
    title: "Loan Products",
    description: "Add new loan product or modify or inactivate loan product",
    link: `${ENDPOINT}/loan-products`,
  },
  {
    icon: <CalendarOutlined />,
    title: "Savings Products",
    description:
      "Add new savings product or modify or inactivate savings product",
    link: `${ENDPOINT}/savings-products`,
  },
  {
    icon: <UserOutlined />,
    title: "Share Products",
    description: "Add new share product or modify or inactivate share product",
    link: `${ENDPOINT}/share-products`,
  },
  {
    icon: <MoneyCollectOutlined />,
    title: "Fixed Deposit Products",
    description: "Add, modify or inactivate a Fixed deposit product",
    link: `${ENDPOINT}/fixed-deposit-products`,
  },
  // {
  //   icon: <MoneyCollectOutlined />,
  //   title: "Recurring Deposit Products",
  //   description: "Add, modify or inactivate a Recurring Deposit product",
  //   link: `${ENDPOINT}/recurring-deposit-products`,
  // },
];

const PageLinksRight: PageLinkType[] = [
  {
    icon: <BookOutlined />,
    title: "Charges",
    description:
      "Define Charges/Penalties For Loan,Share,Savings and Deposit Products",
    link: `${ENDPOINT}/charges`,
  },
  {
    icon: <SettingOutlined />,
    title: "Products Mix",
    description: "Defines rules for taking multiple rules",
    link: `${ENDPOINT}/products-mix`,
  },

  {
    icon: <MoneyCollectOutlined />,
    title: "Manage Tax Configurations",
    description: "Define Tax Components and Tax Groups",
    link: `${ENDPOINT}/manage-tax-configurations`,
  },
  {
    icon: <LineChartOutlined />,
    title: "Floating Rates",
    description: "Define floating rates for loan products",
    link: `${ENDPOINT}/floating-rates`,
  },
];

const ProductPage = () => {
  const { data: session, status } = useSession();
  const mySession = session as MySession | null;

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

export default ProductPage;
