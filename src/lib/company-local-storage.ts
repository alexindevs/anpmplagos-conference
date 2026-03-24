/** Per-company keys so drafts / payment stubs never leak across accounts on shared browsers. */

export function companyBoothDraftKey(companyId: string): string {
  return `companyBoothDraft:${companyId}`;
}

export function companyBoothPaymentResultKey(companyId: string): string {
  return `companyBoothPaymentResult:${companyId}`;
}

// Legacy exports for backward compatibility during migration
export const exhibitorBoothDraftKey = companyBoothDraftKey;
export const exhibitorBoothPaymentResultKey = companyBoothPaymentResultKey;
