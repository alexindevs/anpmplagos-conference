import type { SupportTicketCategory, SupportTicketStatus } from "@/lib/api";

export const SUPPORT_CATEGORY_CHOICES: { value: SupportTicketCategory; label: string }[] = [
  { value: "booth", label: "Booth" },
  { value: "masterclass", label: "Masterclass" },
  { value: "panel", label: "Panel session" },
  { value: "hotel_room", label: "Hotel room" },
  { value: "directory", label: "Directory / public profile" },
  { value: "registrations", label: "Registration" },
  { value: "sponsorship", label: "Sponsorship" },
  { value: "marketing_slots", label: "Marketing slots (advert or branding)" },
  { value: "company_profile", label: "Company profile" },
  { value: "payments", label: "Payments" },
  { value: "other", label: "Other" },
];

export function supportCategoryLabel(category: SupportTicketCategory): string {
  return SUPPORT_CATEGORY_CHOICES.find((c) => c.value === category)?.label ?? category;
}

export function supportStatusLabel(status: SupportTicketStatus): string {
  switch (status) {
    case "open":
      return "Open";
    case "answered":
      return "Answered";
    case "closed":
      return "Closed";
    default:
      return status;
  }
}
