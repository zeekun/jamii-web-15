import { useGet } from "@/api";
import { useEffect } from "react";

type AdvancedAccountingRulesHookResult<T> = {
  data: T | undefined;
  status: string;
  error: any;
};

const useAdvancedAccountingRulesData = <T,>(
  endpoint: string,
  submitType: string,
  setData: (data: T) => void
): AdvancedAccountingRulesHookResult<T> => {
  const { status, data, error } = useGet<T>(`${endpoint}`, [`${endpoint}`]);

  useEffect(() => {
    if (submitType === "update" && status === "success" && data) {
      setData(data);
    }
  }, [submitType, status, data, setData]);

  return { data, status, error };
};

export default useAdvancedAccountingRulesData;
