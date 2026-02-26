import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | Jeffrey Emanuel",
  description: "Get in touch for consulting, collaborations, or media inquiries.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
