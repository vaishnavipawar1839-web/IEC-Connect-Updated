export const calculateFee = (types) => {
  if (!Array.isArray(types)) return 0;
  if (types.includes("Clinical Trial")) return 112100;
  if (types.includes("Research from Other Institute")) return 10000;

  const academicFees = [
    "PG Student Dissertation Research",
    "Other Academic (DNB, DM, Nursing, PhD Research)",
  ];
  return types.some((type) => academicFees.includes(type)) ? 5000 : 0;
};