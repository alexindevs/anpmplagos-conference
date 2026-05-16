import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log in | ANPMP Lagos Conference",
  description: "Sign in to your ANPMP Lagos Conference account.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <Suspense>{children}</Suspense>;
}
