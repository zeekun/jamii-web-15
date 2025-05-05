// utils/format.ts
export function formatCurrency(
  amount: number,
  currencySymbol: string = "",
  decimals: number = 2
): string {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "UGX", // Using USD as base, but we'll replace the symbol
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  // Format the number and replace the dollar sign with the provided symbol
  const formatted = formatter.format(amount);
  return formatted.replace("$", currencySymbol ? `${currencySymbol} ` : "");
}
