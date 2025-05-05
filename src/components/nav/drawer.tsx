import {
  CloseOutlined,
  HomeOutlined,
  MenuFoldOutlined,
} from "@ant-design/icons";
import { Button, Drawer, Menu, Space } from "antd";
import Link from "next/link";
import Image from "next/image";
import { DeviceSize } from "@/types";
import { SetStateAction } from "react";

export default function NavDrawer(props: {
  deviceSize: DeviceSize;
  setOpenDrawer: React.Dispatch<SetStateAction<boolean>>;
  hideDrawer: () => void;
  openDrawer: boolean;
}) {
  const { deviceSize, setOpenDrawer, hideDrawer, openDrawer } = props;

  const handleLinkClick = () => {
    if (deviceSize === "sm") {
      setOpenDrawer(false);
    }
  };
  return (
    <Drawer
      title={
        <Link href={"/"}>
          <Image
            src={`/images/Jamii_logo_flat.png`}
            width={120}
            height={120}
            alt="Jamii System Logo"
            priority={true}
          />
        </Link>
      }
      placement={"left"}
      closable={false}
      onClose={hideDrawer}
      open={openDrawer}
      key={"left"}
      closeIcon={<CloseOutlined />}
      extra={
        <Space>
          <Button onClick={hideDrawer} icon={<MenuFoldOutlined />} />
        </Space>
      }
      width={250}
    >
      <Menu
        style={{ marginTop: "0.2rem" }}
        theme="light"
        mode="inline"
        defaultSelectedKeys={["1"]}
        items={[
          {
            key: "1",
            icon: <HomeOutlined />,
            label: (
              <Link href="/" onClick={handleLinkClick}>
                Home
              </Link>
            ),
          },
          // {
          //   key: "2",
          //   icon: <VideoCameraOutlined />,
          //   label: "nav 2",
          // },
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
    </Drawer>
  );
}
