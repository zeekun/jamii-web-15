export function deleteObjectByKeyValueFromArray(
  array: { [x: string]: unknown }[],
  key: string | number,
  value: unknown
) {
  console.log("array to delete", array);
  return array.filter((obj: { [x: string]: unknown }) => obj[key] !== value);
}

export const formatAccountingRulesData = (
  obj: { [s: string]: unknown } | ArrayLike<unknown>
) => {
  console.log("obj", obj);
  return Object.entries(obj).map(([key, value]) => {
    // Convert camelCase keys to Title Case names
    const name = key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .replace(" Id", "");

    return { name, id: value };
  });
};

export function removeKeysFromObject(
  object: Record<string | number, unknown>,
  keys: (string | number)[]
) {
  // Create a new object by spreading the original object
  const newObject = { ...object };

  // Loop through the keys array and delete each key from the new object
  keys.forEach((key) => {
    delete newObject[key];
  });

  return newObject;
}
