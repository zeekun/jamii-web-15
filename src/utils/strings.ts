export function toCapitalize(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export const filterOption = (
  input: string,
  option?: { label: string; value: string }
) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase());
