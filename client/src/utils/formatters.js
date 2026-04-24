export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function formatCurrency(value) {
  return new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency: "RON",
    maximumFractionDigits: 0
  }).format(value);
}
