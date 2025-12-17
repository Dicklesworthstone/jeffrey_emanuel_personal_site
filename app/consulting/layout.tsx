import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Consulting | Jeffrey Emanuel",
  description: "Advising hedge funds and allocators on AI automation strategy, risk analysis, and workflow design.",
  openGraph: {
    title: "Consulting | Jeffrey Emanuel",
    description: "Advising hedge funds and allocators on AI automation strategy, risk analysis, and workflow design.",
    url: "https://jeffreyemanuel.com/consulting",
  },
};

export default function ConsultingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
