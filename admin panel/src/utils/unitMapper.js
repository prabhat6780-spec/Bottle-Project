export const getUnitNumberByName = (name) => {
  if (!name) return null;
  const match = name.match(/Unit\s+(\d+)/i);
  return match ? parseInt(match[1], 10) : null;
};

export const getUnitNameByNumber = (number) => {
  if (!number) return null;
  return `Unit ${number}`;
};
