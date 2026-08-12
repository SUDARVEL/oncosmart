import { SectionSlot } from "@/components/SectionSlot";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return { title: slug };
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;

  return (
    <SectionSlot
      id={`case-${slug}`}
      title={`Case study · ${slug}`}
      note="Editorial case study template. Define section order (problem → process → outcome) when ready."
    />
  );
}
