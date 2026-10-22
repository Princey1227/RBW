import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | ONLY DENIMS",
  description:
    "Find answers to frequently asked questions about ONLY DENIMS, launching your brand store, shipping, returns, fabric quality, and customer support.",
};

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
