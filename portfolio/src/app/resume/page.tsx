import { SectionSlot } from "@/components/SectionSlot";

export const metadata = { title: "Resume" };

export default function ResumePage() {
  return (
    <SectionSlot
      id="resume"
      title="Resume"
      note="Define layout, experience blocks, skills, and PDF download treatment when ready."
    />
  );
}
