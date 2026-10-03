import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | ONLY Denims",
  description:
    "Read the official Privacy Policy of ONLY Denims (Only Denims Apparels Pvt. Ltd.). Learn how we collect, protect, process, and respect your personal data.",
};

export default function PrivacyPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
