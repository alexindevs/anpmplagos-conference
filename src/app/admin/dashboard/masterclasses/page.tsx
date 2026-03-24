"use client";

import {
  deleteAdminMasterclass,
  getAdminMasterclasses,
  patchAdminMasterclass,
  postAdminMasterclass,
} from "@/lib/api";
import { AdminSessionInventoryPage } from "../components/AdminSessionInventoryPage";

export default function MasterclassesPage() {
  return (
    <AdminSessionInventoryPage
      config={{
        title: "Masterclasses",
        subtitle:
          "Create priced masterclass slots. Companies can purchase published slots that are not on hold or already sold.",
        queryKey: ["admin", "masterclasses"],
        addButtonLabel: "Add masterclass",
        createDefaults: {
          title: "New masterclass",
          description: "Describe this session for buyers.",
        },
        list: getAdminMasterclasses,
        create: postAdminMasterclass,
        patch: patchAdminMasterclass,
        remove: deleteAdminMasterclass,
      }}
    />
  );
}
