import { useGet } from "@/api";
import { Loan } from "@/types";

// Reusable function to fetch loans
export function useFetchLoans(
  tenantId: string,
  clientId: string | undefined,
  loanStatusFilter: object,
  type?: "client" | "group"
) {
  const filterQuery = encodeURIComponent(
    JSON.stringify({ where: loanStatusFilter })
  );
  const endpoint = `${tenantId}/${
    type === "group" ? "groups" : "clients"
  }/${clientId}/loans`;
  const queryKey = clientId ? [`${endpoint}?filter=${filterQuery}`] : [];
  const queryString = `?filter=${JSON.stringify({ where: loanStatusFilter })}`;

  return useGet<Loan[]>(endpoint, queryKey, queryString);
}
