import Big from "big.js";

const formatNumber = (
  number: number | undefined,
  decimalPlaces: number = 0
) => {
  let n = null;
  if (number !== undefined) {
    n = new Intl.NumberFormat(undefined, {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    }).format(number);
  }
  return n;
};

function roundToSixDecimalPlaces(value: number): number {
  return parseFloat(new Big(value).round(6).toString());
}

const formatLargeNumber = (num: number): string => {
  if (num >= 1_000_000_000_000) {
    return `${(num / 1_000_000_000_000).toFixed(1)}T`; // Trillions
  }
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1)}B`; // Billions
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`; // Millions
  }
  return `${num.toLocaleString()}`; // Thousands or less
};

export { formatNumber, roundToSixDecimalPlaces, formatLargeNumber };
