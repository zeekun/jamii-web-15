"use client";
import useMediaQuery from "@/hooks/media-query";
import Image from "next/image";
import Link from "next/link";
import authCoverImage from "../../../public/images/auth-cover2.jpg";
import jamiiLogo from "../../../public/images/Jamii_logo_2.jpg";
import mscLogo from "../../../public/images/MSCLogo.png";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const deviceSize = useMediaQuery();

  return (
    <div className="grid grid-cols-2 h-screen">
      {deviceSize !== "sm" && (
        <div className="col-span-1 relative w-full h-full ">
          <Image
            style={{ objectFit: "cover" }}
            src={authCoverImage}
            alt="Auth Cover Image"
            fill={true}
          />
        </div>
      )}

      <div
        className={`col-span-${
          deviceSize !== "sm" ? 1 : 2
        } flex flex-col justify-between items-center p-8 bg-white`}
      >
        <div className=" w-1/2">
          <Image className="mt-10" src={jamiiLogo} alt="Jamii Systems Logo" />
        </div>

        <div className="w-full max-w-md mt-10 mb-auto">
          {children}

          <p className="text-gray-500 mt-4 text-sm">
            Jamii Systems is an MIS software system that helps automate and
            digitise operations of SACCOs, MFIs, SMEs and Groups/VSLAs operating
            in Uganda.
          </p>
        </div>
        <h1 className="text-gray-500 font-bold text-base">A PRODUCT OF</h1>
        <div className="my-4  w-20">
          <Link href={"https://msc.co.ug/"} target="blank">
            <Image src={mscLogo} alt="MSC Logo." />
          </Link>
        </div>
      </div>
    </div>
  );
}
