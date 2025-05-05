import React from "react";
import { Button as AntButton, ButtonProps as AntButtonProps } from "antd";
import classNames from "classnames";
import "./css/MyButton.css"; // Optional: For custom styles

// Create a custom prop type by extending ButtonProps
interface MyButtonProps extends Omit<AntButtonProps, "type"> {
  type?:
    | "primary"
    | "default"
    | "dashed"
    | "link"
    | "text"
    | "danger"
    | "gray"
    | "green"
    | "warning"
    | "black";
}

const MyButton: React.FC<MyButtonProps> = ({ type, className, ...props }) => {
  // Apply custom styles for the "danger" and "gray" types
  const buttonClass = classNames(className, {
    "custom-button-danger": type === "danger",
    "custom-button-gray": type === "gray",
    "custom-button-green": type === "green",
    "custom-button-warning": type === "warning",
    "custom-button-black": type === "black",
  });

  // Pass the correct type to Ant Button (excluding "danger" and "gray")
  const antButtonType =
    type === "danger" ||
    type === "gray" ||
    type === "green" ||
    type === "black" ||
    type === "warning"
      ? undefined
      : type;

  return <AntButton {...props} className={buttonClass} type={antButtonType} />;
};

export default MyButton;
