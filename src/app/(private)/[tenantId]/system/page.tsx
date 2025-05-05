"use client";
import PageHeader from "@/components/page-header";
import PageLink from "@/components/page-link";
import { MySession, PageLinkType } from "@/types";
import {
  BookOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  ClusterOutlined,
  KeyOutlined,
  MoneyCollectOutlined,
  ProfileOutlined,
  SettingOutlined,
  TableOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { Card } from "antd";
import { ENDPOINT, PAGE_TITLE } from "./constants";
import { useSession } from "next-auth/react";

const PageLinksLeft: PageLinkType[] = [
  // {
  //   icon: <TableOutlined />,
  //   title: "Manage Data Tables",
  //   description: "Add new extra fields to any entity in form of data table",
  //   link: `${ENDPOINT}/loans`,
  // },
  {
    icon: <UnorderedListOutlined />,
    title: "Manage Codes",
    description: "Codes are used to define drop down values",
    link: `${ENDPOINT}/codes`,
  },
  {
    icon: <KeyOutlined />,
    title: "Manage Roles And Permissions",
    description: "Define or modify roles and associated permissions",
    link: `${ENDPOINT}/roles`,
  },
  // {
  //   icon: <ClusterOutlined />,
  //   title: "Configure Maker Checker Tasks",
  //   description: "Define or modify maker checker tasks",
  //   link: `#`,
  // },
  // {
  //   icon: <ProfileOutlined />,
  //   title: "Manage Hooks",
  //   description: "Define hooks",
  //   link: `#`,
  // },
  // {
  //   icon: <BookOutlined />,
  //   title: "Entity To Entity Mapping",
  //   description: "Define or modify entity to entity mappings",
  //   link: `#`,
  // },
  // {
  //   icon: <ProfileOutlined />,
  //   title: "Manage Surveys",
  //   description: "Manage your surveys",
  //   link: `#`,
  // },
];

const PageLinksRight: PageLinkType[] = [
  {
    icon: <UnorderedListOutlined />,
    title: "Audit Trails",
    description: "Defines rules for taking multiple rules",
    link: `${ENDPOINT}/audit-trails`,
  },
  {
    icon: <MoneyCollectOutlined />,
    title: "Manage Reports",
    description: "Add new reports and classify reports",
    link: `reports`,
  },
  {
    icon: <ClockCircleOutlined />,
    title: "Scheduler Jobs",
    description: "Schedule a job, modify or delete jobs",
    link: `${ENDPOINT}/manage-scheduler-jobs`,
  },
  // {
  //   icon: <SettingOutlined />,
  //   title: "Configurations",
  //   description: "Global Configurations and Cache Settings",
  //   link: `#`,
  // },
  // {
  //   icon: <CalendarOutlined />,
  //   title: "Account Number Preferences",
  //   description:
  //     "Preferences for generating account numbers for client,loan and savings accounts",
  //   link: `#`,
  // },
  // {
  //   icon: <SettingOutlined />,
  //   title: "External Services",
  //   description: "External Services configuration",
  //   link: "#",
  // },
  // {
  //   icon: <KeyOutlined />,
  //   title: "Two Factor Configuration",
  //   description: "Two Factor authentication configuration settings",
  //   link: "#",
  // },
];
export default function SystemPage() {
  const { data: session, status } = useSession();
  const mySession = session as MySession | null;

  // let testPlanLeft: PageLinkType[] = [];
  // let testPlanRight: PageLinkType[] = [];

  // if (mySession?.user.roles?.includes("Test Plan 1.0")) {
  //   // testPlanLeft.push(PageLinksLeft[0]);
  //   // testPlanLeft.push(PageLinksLeft[1]);
  //   testPlanLeft.push(PageLinksLeft[2]);

  //   // testPlanRight.push(PageLinksRight[1]);
  //   // testPlanRight.push(PageLinksRight[3]);
  //   // testPlanRight.push(PageLinksRight[4]);
  //   // testPlanRight.push(PageLinksRight[5]);
  // }

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
}
