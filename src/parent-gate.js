// A local parental gate, not identity verification. Never persist the entered year.
export function isAdultYear(value, currentYear = new Date().getFullYear()) {
  const year = value.trim();
  return /^\d{4}$/.test(year) && Number(year) >= currentYear - 120 && Number(year) <= currentYear - 18;
}
