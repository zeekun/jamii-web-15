"use client";
import { useGet, useGetById } from "@/api";
import Breadcrumbs from "@/components/breadcrumb";
import NavDrawer from "@/components/nav/drawer";
import NavHeader from "@/components/nav/header";
import useMediaQuery from "@/hooks/media-query";
import { RolesProvider } from "@/providers/RolesProvider";
import { MySession, Tenant } from "@/types";
import { Card, Layout, theme } from "antd";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import mscLogo from "../../../public/images/MSCLogo.png";
import dayjs from "dayjs";
import "@ant-design/v5-patch-for-react-19";

const { Content } = Layout;

export default function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { tenantId } = useParams();
  const [openDrawer, setOpenDrawer] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [tenantName, setTenantName] = useState("...");

  const { data: session } = useSession();
  const mySession = session as MySession | null;

  const showDrawer = () => {
    setOpenDrawer(true);
  };

  const hideDrawer = () => {
    setOpenDrawer(false);
  };

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const deviceSize = useMediaQuery();

  useEffect(() => {
    if (deviceSize !== "sm") {
      setOpenDrawer(false);
    }
  }, [deviceSize]);

  const { status: tenantStatus, data: tenant } = useGetById<Tenant>(
    `${tenantId}/tenants`,
    Number(tenantId)
  );

  const userTenants = useGet<Tenant[]>(
    mySession?.user?.userId
      ? `${tenantId}/users/${mySession.user.userId}/tenants`
      : null,
    [`user-tenants`, `${tenantId}`] // Better query key structure
  );

  useEffect(() => {
    if (tenantStatus === "success" && tenant?.name) {
      setTenantName(tenant.name);
    }
  }, [tenantStatus, tenant]);

  return (
    <RolesProvider>
      <Layout style={{ minHeight: "100vh" }}>
        {/* {deviceSize !== "sm" && <NavSider collapsed={collapsed} />} */}

        <Layout
          style={{
            marginLeft: deviceSize === "sm" ? 0 : collapsed ? 0 : 200,
            transition: "margin-left 0.2s",
          }}
        >
          <NavHeader
            deviceSize={deviceSize}
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            colorBgContainer={colorBgContainer}
            showDrawer={showDrawer}
            tenantId={tenantId as string}
          />

          <NavDrawer
            deviceSize={deviceSize}
            setOpenDrawer={setOpenDrawer}
            hideDrawer={hideDrawer}
            openDrawer={openDrawer}
          />

          <div
            className="px-20 py-3 shadow-lg"
            style={{
              position: "fixed",
              top: 64,
              left: deviceSize === "sm" ? 0 : collapsed ? 0 : 200,
              right: 0,
              zIndex: 1000,
              background: colorBgContainer,
              transition: "left 0.2s",
            }}
          >
            <Breadcrumbs
              tenantId={tenantId as string}
              tenantName={tenantName}
              userTenants={userTenants}
            />
          </div>

          <Content
            className="md:px-20 py-5 bg-slate-200"
            style={{
              marginTop: "6.8rem",
            }}
          >
            <Card>{children}</Card>
          </Content>
          <div className="text-black text-center p-2 flex justify-center gap-2 shadow-lg  items-center">
            <span>Powered by </span>
            <Link href={"https://msc.co.ug/"} target="blank">
              <Image src={mscLogo} alt="MSC Logo" width={40} />
            </Link>

            <span> (c) {dayjs().format("YYYY")}</span>
          </div>
        </Layout>
      </Layout>
    </RolesProvider>
  );
}
