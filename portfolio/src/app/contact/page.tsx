import { SectionSlot } from "@/components/SectionSlot";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <SectionSlot
      id="contact"
      title="Contact"
      note="Form fields + success state. Submissions will go to Supabase messages. Define copy and layout when ready."
    />
  );
}
