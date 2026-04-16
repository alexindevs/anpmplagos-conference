import { redirect } from "next/navigation";
import { FLOOR_PLAN_PDF_PATH } from "@/lib/floor-plan";

/**
 * Visiting this route sends the user straight to the conference floor plan PDF
 * (browser opens inline or offers download depending on settings).
 */
export default function CompanyFloorPlanPage() {
  redirect(FLOOR_PLAN_PDF_PATH);
}
