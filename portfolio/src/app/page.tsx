import { SectionSlot } from "@/components/SectionSlot";

export default function HomePage() {
  return (
    <>
      <SectionSlot
        id="hero"
        title="Hero"
        note="Define this first: brand/name treatment, headline, supporting line, CTAs, and whether the 3D scene is full-bleed background or interactive."
      />
      <SectionSlot id="selected-work" title="Selected work" />
      <SectionSlot id="about" title="About / craft" />
      <SectionSlot id="cta" title="Closing CTA" />
    </>
  );
}
