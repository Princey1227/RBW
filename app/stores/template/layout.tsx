import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Partner Brand Storefront Template | ONLY DENIMS",
  description:
    "Explore the turnkey digital storefront and 3D atelier template for apparel labels and partner brands on OnlyDenims. Direct mill manufacturing, bespoke 3D visualization, and Gokwik checkout.",
};

export default function TemplateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
