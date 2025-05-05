"use client";
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  DownOutlined,
  UserOutlined,
  LogoutOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { Button, Dropdown, Layout, MenuProps, Space } from "antd";
import Link from "next/link";
import Image from "next/image";
import { DeviceSize, MySession } from "@/types";
import { SetStateAction, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import CreateModal from "../create.modal";
import SupportForm from "@/app/(private)/[tenantId]/support/create.form";

const { Header } = Layout;

export default function NavHeader(props: {
  colorBgContainer: string;
  deviceSize: DeviceSize;
  collapsed: boolean;
  setCollapsed: React.Dispatch<SetStateAction<boolean>>;
  showDrawer: () => void;
  tenantId: string | string[];
}) {
  const { data: session } = useSession();
  const mySession = session as MySession | null;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const userItems: MenuProps["items"] = [
    {
      label: (
        <Link href={`/${props.tenantId}/support`}>
          <MessageOutlined /> Support
        </Link>
      ),
      key: "2",
    },
    {
      label: (
        <a
          onClick={(e) => {
            e.preventDefault();
            signOut({ redirect: true, callbackUrl: `/` });
          }}
        >
          <LogoutOutlined /> Logout
        </a>
      ),
      key: "1",
    },
  ];

  const adminItems = (
    tenantId: string | string[],
    mySession: MySession | null
  ): MenuProps["items"] => {
    const items: MenuProps["items"] = [
      {
        label: <Link href={`/1/tenants`}>Tenants</Link>,
        key: "tenants",
      },
      {
        label: <Link href={`/${tenantId}/support`}>Support</Link>,
        key: "support",
      },
      {
        label: <Link href={`/${tenantId}/users`}>Users</Link>,
        key: "1",
      },
      {
        label: <Link href={`/${tenantId}/organisation`}>Organisation</Link>,
        key: "2",
      },
      {
        label: <Link href={`/${tenantId}/system`}>System</Link>,
        key: "3",
      },
      {
        label: <Link href={`/${tenantId}/products`}>Products</Link>,
        key: "4",
      },
      {
        label: <Link href={`/${tenantId}/system/templates`}>Templates</Link>,
        key: "5",
      },
    ];

    // Filter items if the user doesn't have the "super" role
    if (mySession?.user.roles?.includes("super") === false) {
      return items.slice(2); // Remove the "Tenants" menu item
    }

    return items;
  };

  const { colorBgContainer, deviceSize, collapsed, showDrawer, tenantId } =
    props;

  return (
    <Header
      className="flex justify-between items-center  pl-0 pr-5"
      style={{
        background: colorBgContainer,
        borderBottom: "1px solid #ccc",
        position: "fixed",
        top: 0,
        left: deviceSize === "sm" ? 0 : collapsed ? 0 : 200,
        right: 0,
        zIndex: 1000,
        transition: "left 0.2s",
        fontSize: "16px",
      }}
    >
      <div className="flex items-center">
        {deviceSize !== "sm" ? null : (
          <div className="flex justify-start">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={showDrawer}
              style={{
                fontSize: "16px",
                width: 64,
                height: 64,
              }}
            />
          </div>
        )}
        <Link href={`/${tenantId}`}>
          <Image
            src={`/images/Jamii_logo_${collapsed ? "cropped" : "flat"}.png`}
            width={collapsed ? 70 : 150}
            height={collapsed ? 70 : 150}
            alt="Jamii System Logo"
            priority={true}
          />
        </Link>
        {deviceSize !== "sm" && (
          <div className="flex space-x-8 ml-4 text-blue-600">
            <Dropdown menu={{ items: clientItems(tenantId) }}>
              <a onClick={(e) => e.preventDefault()}>
                <Space>
                  Clients
                  <DownOutlined />
                </Space>
              </a>
            </Dropdown>

            <Link href={`/${tenantId}/accounting`}>
              <Space>Accounting</Space>
            </Link>

            <Dropdown menu={{ items: reportItems(tenantId) }}>
              <a onClick={(e) => e.preventDefault()}>
                <Space>
                  Reports
                  <DownOutlined />
                </Space>
              </a>
            </Dropdown>

            <Dropdown menu={{ items: adminItems(tenantId, mySession) }}>
              <a onClick={(e) => e.preventDefault()}>
                <Space>
                  Admin
                  <DownOutlined />
                </Space>
              </a>
            </Dropdown>
          </div>
        )}
      </div>

      <div className="flex space-x-8">
        <CreateModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          pageTitle={"Ticket"}
          CreateForm={
            <SupportForm tenantId={tenantId} setIsModalOpen={setIsModalOpen} />
          }
          width={700}
        />

        <Dropdown menu={{ items: userItems }}>
          <a onClick={(e) => e.preventDefault()}>
            <Space>
              {(deviceSize !== "sm" &&
                deviceSize !== "md" &&
                mySession?.user?.username) ||
                mySession?.user?.email}
              <UserOutlined />
            </Space>
          </a>
        </Dropdown>
      </div>
    </Header>
  );
}

const clientItems = (tenantId: string | string[]): MenuProps["items"] => [
  {
    label: <Link href={`/${tenantId}/clients`}>Clients</Link>,
    key: "1",
  },
  {
    label: <Link href={`/${tenantId}/groups`}>Groups</Link>,
    key: "2",
  },
  // {
  //   label: <Link href={`/${tenantId}/centers`}>Centers</Link>,
  //   key: "3",
  // },
];

const reportItems = (tenantId: string | string[]): MenuProps["items"] => [
  {
    label: <Link href={`/${tenantId}/reports`}>All</Link>,
    key: "1",
  },
  {
    label: <Link href={`/${tenantId}/reports/clients`}>Clients</Link>,
    key: "2",
  },
  {
    label: <Link href={`/${tenantId}/reports/loans`}>Loans</Link>,
    key: "3",
  },
  {
    label: <Link href={`/${tenantId}/reports/savings`}>Savings</Link>,
    key: "4",
  },
  {
    label: <Link href={`/${tenantId}/reports/funds`}>Funds</Link>,
    key: "5",
  },
  {
    label: <Link href={`/${tenantId}/reports/accounting`}>Accounting</Link>,
    key: "6",
  },
  {
    label: <Link href={`/${tenantId}/reports/all`}>XBRL</Link>,
    key: "7",
  },
];
