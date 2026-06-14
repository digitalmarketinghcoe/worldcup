import { SmoothScroll } from "@/components/providers/smooth-scroll";
import { Navbar } from "@/components/sections/navbar";
import { FloatingCta } from "@/components/sections/floating-cta";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <SmoothScroll>{children}</SmoothScroll>
      <FloatingCta />
    </>
  );
}
