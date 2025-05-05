import { useRouter } from "next/navigation";
import { MouseEvent } from "react";

export const useRowClickHandler = <
  T extends {
    id?: string | number | undefined;
    userId?: number;
    transactionId?: string;
    productId?: number;
  }
>(config?: {
  url?: string;
  rowType?: string;
  clickRow?: boolean;
}) => {
  const router = useRouter();

  const handleRowClick = async (record: T, e?: MouseEvent<HTMLElement>) => {
    // Prevent row click if the event came from a button or interactive element
    if (e && (e.target as HTMLElement).closest("[data-prevent-row-click]")) {
      return;
    }

    const currentPath = window.location.pathname;
    if (!record.id) {
      console.warn("Record does not have a valid ID.");
      return;
    }

    if (config?.clickRow) {
      let redirectUrl;
      if (config?.rowType === "Tenant") {
        redirectUrl = `/${record.id}`;
      } else if (config?.rowType === "ProductMix") {
        redirectUrl = `${config?.url}/${record.productId}`;
      } else if (config?.rowType === "User") {
        redirectUrl = `${config?.url}/${record.userId}`;
      } else if (config?.rowType === "JournalEntry") {
        redirectUrl = `${config?.url}/${record.transactionId}`;
      } else {
        redirectUrl = config?.url
          ? `${config?.url}/${record.id}`
          : `${currentPath}/${record.id}`;
      }

      await router.push(redirectUrl);
    }
  };

  const onRow = (record: T, rowIndex?: number) => {
    return {
      onClick: (e: MouseEvent<HTMLElement>) => handleRowClick(record, e),
      role: "link",
      onMouseEnter: (event: React.MouseEvent<HTMLElement>) => {
        (event.currentTarget as HTMLElement).style.cursor = config?.clickRow
          ? "pointer"
          : "default";
      },
      onMouseLeave: (event: React.MouseEvent<HTMLElement>) => {
        (event.currentTarget as HTMLElement).style.cursor = "default";
      },
    };
  };

  return { onRow };
};
