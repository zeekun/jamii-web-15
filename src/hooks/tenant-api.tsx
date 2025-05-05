import { useCreate, useGet, useGetById, usePatch } from "@/api";
import { useParams } from "next/navigation";

export function useTenantEndpoint<T>() {
  const { tenantId } = useParams();

  return {
    useTenantGet: (endpoint: string, queryKey: string[]) =>
      useGet<T>(`${tenantId}/${endpoint}`, [`${tenantId}`, ...queryKey]),

    useTenantGetById: (endpoint: string, id: number | undefined) =>
      useGetById<T>(`${tenantId}/${endpoint}`, id),

    useTenantCreate: (endpoint: string, queryKey: string[]) =>
      useCreate<T>(`${tenantId}/${endpoint}`, [`${tenantId}`, ...queryKey]),

    useTenantPatch: (
      endpoint: string,
      id: number | undefined,
      queryKey: string[]
    ) => usePatch(`${tenantId}/${endpoint}`, id, [`${tenantId}`, ...queryKey]),
  };
}
