"use client";
import PageHeader from "@/components/page-header";
import PageLink from "@/components/page-link";
import { MySession, PageLinkType } from "@/types";
import {
  BookOutlined,
  CalendarOutlined,
  HomeOutlined,
  LockFilled,
  LockOutlined,
  MoneyCollectOutlined,
  RedoOutlined,
  SearchOutlined,
  SettingFilled,
  SettingOutlined,
} from "@ant-design/icons";
import { Card } from "antd";
import { ENDPOINT, PAGE_TITLE } from "./constants";
import {
  CalendarCloseIcon,
  CrossDiversionIcon,
  HierarchyIcon,
  JournalArrowUpIcon,
  MigrateIcon,
} from "@/icons";
import { useSession } from "next-auth/react";

const PageLinksLeft: PageLinkType[] = [
  // {
  //   icon: <RedoOutlined />,
  //   title: "Frequent Postings",
  //   description: "These are predefined postings.",
  //   link: `#`,
  // },
  {
    icon: <JournalArrowUpIcon />,
    title: "Add Journal Entries",
    description: "Manual journal entry transactions recorded in a journal",
    link: `${ENDPOINT}/journal-entries`,
  },
  {
    icon: <SearchOutlined />,
    title: "Search Journal Entries",
    description: "Manual journal entry transactions recorded in a journal",
    link: `${ENDPOINT}/journal-entries/search`,
  },
  {
    icon: <CrossDiversionIcon />,
    title: "Accounts Linked to Financial Activities",
    description: "List of financial activity and GL account mappings",
    link: `${ENDPOINT}/financial-activity-mappings`,
  },

  // {
  //   icon: <MigrateIcon />,
  //   title: "Migrate Opening Balances (Office-Wise)",
  //   description: "Set or update office-level opening balances for GL Accounts",
  //   link: `${ENDPOINT}/charges`,
  // },
];

const PageLinksRight: PageLinkType[] = [
  {
    icon: <HierarchyIcon />,
    title: "Chart Of Accounts",
    description: "List of accounts used by the organisation",
    link: `${ENDPOINT}/chart-of-accounts`,
  },
  // {
  //   icon: <CalendarCloseIcon />,
  //   title: "Closing Entries",
  //   description: "Journal entries made at the end of the accounting period ",
  //   link: `#`,
  // },
  {
    icon: <LockFilled />,
    title: "Accounting Rules",
    description: "List of all accounting rules",
    link: `${ENDPOINT}/accounting-rules`,
  },
  // {
  //   icon: <SettingFilled />,
  //   title: "Accruals",
  //   description:
  //     "Accrues income, expenses and liabilities as on the provided date",
  //   link: `#`,
  // },
  // {
  //   icon: <SettingFilled />,
  //   title: "Provisioning Entries",
  //   description: "Create provisioning entries",
  //   link: `#`,
  // },
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
