import { SectionSlot } from "@/components/SectionSlot";

export default function HomePage() {
  return (
    <>
      <SectionSlot
        id="hero"
        title="Hero"
        note="Define this first. Inspiration: docs/INSPIRATION.md (Wall of Portfolios interactive). Tell me preferred vibe links + name, headline, CTAs, and motion level (light / scroll / 3D accent)."
      />
      <SectionSlot id="selected-work" title="Selected work" />
      <SectionSlot id="about" title="About / craft" />
      <SectionSlot id="cta" title="Closing CTA" />
    </>
  );
}
