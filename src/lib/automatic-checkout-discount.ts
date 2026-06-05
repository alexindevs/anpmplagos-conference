/**
 * Calendar discount windows for company cart (booth & sponsorship plan lines only).
 * Keep in sync with the API.
 */
export function getAutomaticCheckoutDiscountPercent(now = new Date()): 0 | 5 | 10 {
  const y = now.getFullYear();
  const mayEnd = new Date(y, 4, 31, 23, 59, 59, 999);
  const juneEnd = new Date(y, 5, 30, 23, 59, 59, 999);
  const t = now.getTime();
  if (t <= mayEnd.getTime()) return 10;
  if (t <= juneEnd.getTime()) return 5;
  return 0;
}

export function discountAmountKobo(amountKobo: number, percent: number): number {
  if (amountKobo <= 0 || percent <= 0) return 0;
  return Math.round((amountKobo * percent) / 100);
}

export function applyAutomaticDiscountKobo(amountKobo: number, percent: number): number {
  return Math.max(0, amountKobo - discountAmountKobo(amountKobo, percent));
}
