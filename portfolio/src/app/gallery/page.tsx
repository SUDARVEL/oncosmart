import { SectionSlot } from "@/components/SectionSlot";

export const metadata = { title: "Gallery" };

export default function GalleryPage() {
  return (
    <SectionSlot
      id="gallery"
      title="3D Gallery"
      note="Spatial room (R3F). Define navigation style (orbit vs walk), hotspot UI, and mobile fallback when ready."
    />
  );
}
