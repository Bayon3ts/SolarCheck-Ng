import { Metadata } from "next";

export const metadata: Metadata = {
  title: "List Your Solar Company on SolarCheck Nigeria — Free",
  description:
    "Join Nigeria's first verified solar installer directory. Get discovered by homeowners actively looking for solar installers in your area.",
};

export default function ApplyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
