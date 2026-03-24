"use client";

import {
  deleteAdminPanel,
  getAdminPanels,
  patchAdminPanel,
  postAdminPanel,
} from "@/lib/api";
import { AdminSessionInventoryPage } from "../components/AdminSessionInventoryPage";

export default function PanelsPage() {
  return (
    <AdminSessionInventoryPage
      config={{
        title: "Panel sessions",
        subtitle:
          "Create priced panel session slots. Companies can purchase published slots that are not on hold or already sold.",
        queryKey: ["admin", "panels"],
        addButtonLabel: "Add panel session",
        createDefaults: {
          title: "New panel session",
          description: "Describe this panel for buyers.",
        },
        list: getAdminPanels,
        create: postAdminPanel,
        patch: patchAdminPanel,
        remove: deleteAdminPanel,
      }}
    />
  );
}
