"use client";

import {
  deleteAdminPresentation,
  getAdminPresentations,
  patchAdminPresentation,
  postAdminPresentation,
} from "@/lib/api";
import { AdminSessionInventoryPage } from "../components/AdminSessionInventoryPage";

export default function PresentationsPage() {
  return (
    <AdminSessionInventoryPage
      config={{
        title: "Presentations",
        subtitle:
          "Create priced presentation slots. Companies can purchase published slots that are not on hold or already sold.",
        queryKey: ["admin", "presentations"],
        addButtonLabel: "Add presentation",
        createDefaults: {
          title: "New presentation",
          description: "Describe this presentation for buyers.",
        },
        list: getAdminPresentations,
        create: postAdminPresentation,
        patch: patchAdminPresentation,
        remove: deleteAdminPresentation,
      }}
    />
  );
}
