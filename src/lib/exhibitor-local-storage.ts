/** Per-exhibitor keys so drafts / payment stubs never leak across accounts on shared browsers. */

export function exhibitorBoothDraftKey(exhibitorId: string): string {
  return `exhibitorBoothDraft:${exhibitorId}`;
}

export function exhibitorBoothPaymentResultKey(exhibitorId: string): string {
  return `exhibitorBoothPaymentResult:${exhibitorId}`;
}
