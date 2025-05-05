import { DeviceSize } from "@/types";
import { useState, useEffect } from "react";

const getDeviceConfig = (width: number): DeviceSize => {
  if (width < 640) {
    return "sm";
  } else if (width < 768) {
    return "md";
  } else if (width < 1024) {
    return "lg";
  } else if (width < 1280) {
    return "xl";
  } else {
    return "2xl";
  }
};

const useMediaQuery = () => {
  const [deviceSize, setDeviceSize] = useState(() =>
    typeof window !== "undefined" ? getDeviceConfig(window.innerWidth) : "lg"
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const handleResize = () => {
      setDeviceSize(getDeviceConfig(window.innerWidth));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return deviceSize;
};

export default useMediaQuery;
