"use client";
import PageHeader from "@/components/page-header";
import PageLink from "@/components/page-link";
import { MySession, PageLinkType } from "@/types";
import {
  BookOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  DollarCircleOutlined,
  DoubleRightOutlined,
  EditOutlined,
  HomeOutlined,
  ImportOutlined,
  LockOutlined,
  MessageOutlined,
  MoneyCollectOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Card } from "antd";
import { ENDPOINT, PAGE_TITLE } from "./constants";
import { CrossDiversionIcon } from "@/icons";
import { useSession } from "next-auth/react";

const PageLinksLeft: PageLinkType[] = [
  {
    icon: <HomeOutlined />,
    title: "Manage Offices",
    description:
      "Add new office or modify or deactivate office or modify office hierarchy",
    link: `${ENDPOINT}/offices`,
  },
  {
    icon: <CalendarOutlined />,
    title: "Manage Holidays",
    description: "Define holidays for office",
    link: `${ENDPOINT}/holidays`,
  },
  {
    icon: <UserOutlined />,
    title: "Manage Employees",
    description:
      "An employee represents loan officers with no access to systems",
    link: `${ENDPOINT}/employees`,
  },
  // {
  //   icon: <BookOutlined />,
  //   title: "Standing Instructions History",
  //   description: "View logged history of standing instructions",
  //   link: "#",
  // },
  // {
  //   icon: <CrossDiversionIcon />,
  //   title: "Fund Mapping",
  //   description: "Bulk entry screen for mapping fund sources to loans",
  //   link: `${ENDPOINT}/fund-mapping`,
  // },
  // {
  //   icon: <LockOutlined />,
  //   title: "Password Preferences",
  //   description:
  //     "Define standards for enforcing the usage of stronger passwords",
  //   link: "#",
  // },
  {
    icon: <EditOutlined />,
    title: "Loan Provisioning Criteria",
    description: "Define Loan Provisioning Criteria for Organization",
    link: `${ENDPOINT}/provisioning-criteria`,
  },
  // {
  //   icon: <CheckCircleOutlined />,
  //   title: "Entity Data Table Checks",
  //   description: "Define Entity Data Table Checks for Organization",
  //   link: "#",
  // },
];

const PageLinksRight: PageLinkType[] = [
  // {
  //   icon: <SettingOutlined />,
  //   title: "Currency Configuration",
  //   description:
  //     "Currencies available across organization for different products",
  //   link: `${ENDPOINT}/currencies`,
  // },
  {
    icon: <MoneyCollectOutlined />,
    title: "Manage Funds",
    description: "Funds are associated with loans",
    link: `${ENDPOINT}/funds`,
  },
  // {
  //   icon: <MoneyCollectOutlined />,
  //   title: "Bulk Loan Reassignment",
  //   description: "Easy way to reassign all the loan from one LO to another LO",
  //   link: `${ENDPOINT}/bulk-loan`,
  // },
  {
    icon: <MoneyCollectOutlined />,
    title: "Teller Cashier Management",
    description: "Manage Tellers / Cashiers and Cash Allocation and Settlement",
    link: `${ENDPOINT}/tellers`,
  },
  {
    icon: <CalendarOutlined />,
    title: "Working Days",
    description:
      "Define working days and configure behavior of payments due on holidays",
    link: `${ENDPOINT}/working-days`,
  },
  {
    icon: <DollarCircleOutlined />,
    title: "Payment Type",
    description: "Manage payment types",
    link: `${ENDPOINT}/payment-types`,
  },
  // {
  //   icon: <MessageOutlined />,
  //   title: "SMS Campaigns",
  //   description: "Define SMS Campaigns for Organization",
  //   link: `${ENDPOINT}/sms-campaigns`,
  // },
  // {
  //   icon: <DoubleRightOutlined />,
  //   title: "AdHocQuery",
  //   description: "Define AdhocQuery for Organization",
  //   link: "#",
  // },
  // {
  //   icon: <ImportOutlined />,
  //   title: "Bulk Import",
  //   description:
  //     "Bulk data import using excel spreadsheet templates for clients, offices, etc.",
  //   link: "#",
  // },
];

export default function OrganisationPage() {
  const { data: session, status } = useSession();
  const mySession = session as MySession | null;

  // let testPlanLeft: PageLinkType[] = [];
  // let testPlanRight: PageLinkType[] = [];

  // if (mySession?.user.roles?.includes("Test Plan 1.0")) {
  //   testPlanLeft.push(PageLinksLeft[0]);
  //   testPlanLeft.push(PageLinksLeft[1]);
  //   testPlanLeft.push(PageLinksLeft[2]);

  //   testPlanRight.push(PageLinksRight[1]);
  //   testPlanRight.push(PageLinksRight[3]);
  //   testPlanRight.push(PageLinksRight[4]);
  //   testPlanRight.push(PageLinksRight[5]);
  // }

  return (
    <>
      <PageHeader pageTitle={PAGE_TITLE} />
      <div className="grid grid-cols-2 gap-4">
        <Card className="">
          <ul>
            {PageLinksLeft.map((link, i) => (
              <div key={i}>
                <PageLink
                  icon={link.icon}
                  title={link.title}
                  description={link.description}
                  link={link.link}
                />
              </div>
            ))}
          </ul>
        </Card>
        <Card className="">
          <ul>
            {PageLinksRight.map((link, i) => (
              <div key={i}>
                <PageLink
                  icon={link.icon}
                  title={link.title}
                  description={link.description}
                  link={link.link}
                />
              </div>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
