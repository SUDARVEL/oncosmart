/**
 * Section content is intentionally empty.
 * You will define each section (starting with Hero) before we implement it.
 */
export const siteConfig = {
  name: "Portfolio", // replace with your name / brand
  nav: [
    { href: "/", label: "Home" },
    { href: "/work", label: "Work" },
    { href: "/gallery", label: "Gallery" },
    { href: "/resume", label: "Resume" },
    { href: "/contact", label: "Contact" },
  ],
} as const;

export type HomeSectionId =
  | "hero"
  | "selected-work"
  | "about"
  | "cta";

/** Mark sections as ready only after you define them. */
export const homeSectionStatus: Record<HomeSectionId, "awaiting" | "defined"> = {
  hero: "awaiting",
  "selected-work": "awaiting",
  about: "awaiting",
  cta: "awaiting",
};
