"use client";
import React from "react";
import { Button, Result } from "antd";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  // const onClickHome = () => {
  //   router.push("/");
  // };

  const onClickBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <Result
      className="bg-white h-screen"
      title="404"
      subTitle="Sorry, the page you visited does not exist."
      extra={
        <div className="flex justify-center gap-2">
          <Button type="default" onClick={onClickBack}>
            Go Back
          </Button>
          {/* <Button type="primary" onClick={onClickHome}>
            Back Home
          </Button> */}
        </div>
      }
    />
  );
}
