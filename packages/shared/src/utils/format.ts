export function formatCurrency(
  amount: number,
  currency = "GBP",
  locale = "en-GB",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount / 100);
}

export function formatDate(date: string | Date, locale = "en-GB"): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
  }).format(typeof date === "string" ? new Date(date) : date);
}
