import { Layout, Menu } from "antd";
import Link from "next/link";
import Image from "next/image";
import { HomeOutlined } from "@ant-design/icons";

const { Sider } = Layout;
export default function NavSider(props: { collapsed: boolean }) {
  const { collapsed } = props;
  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      className="bg-green-900"
      theme="dark"
      style={{
        //background: "#7ac349",
        borderRight: "1px solid #ccc",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
      }}
    >
      <div
        className="demo-logo-vertical bg-white flex items-center justify-center"
        style={{ minHeight: "4rem", borderBottom: "1px solid #ccc" }}
      >
        <Link href={"/"}>
          {" "}
          <Image
            src={`/images/Jamii_logo_${collapsed ? "cropped" : "flat"}.png`}
            width={collapsed ? 70 : 150}
            height={collapsed ? 70 : 150}
            alt="Jamii System Logo"
            priority={true}
          />
        </Link>
      </div>
      <Menu
        style={{ marginTop: "0.2rem", background: "transparent" }}
        theme="dark"
        mode="inline"
        defaultSelectedKeys={["1"]}
        items={[
          {
            key: "1",
            icon: <HomeOutlined />,
            label: <Link href="/">Home</Link>,
          },
          // {
          //   key: "3",
          //   icon: <UploadOutlined />,
          //   label: "nav 3",
          //   children: [
          //     {
          //       key: "4",
          //       icon: <VideoCameraOutlined />,
          //       label: "nav 4",
          //     },
          //     {
          //       key: "5",
          //       icon: <VideoCameraOutlined />,
          //       label: "nav 5",
          //     },
          //   ],
          // },
        ]}
      />
    </Sider>
  );
}
