import { PageShell } from "@/components/page-shell";
import { cmsPageMetadata } from "@/lib/cms/metadata";
import { getCmsPage } from "@/lib/cms/service";

export default async function SustainabilityPage() {
  const page = await getCmsPage("sustainability");

  return (
    <PageShell
      title={page.title}
      headline={page.headline}
      description={page.description}
      nextStep={`Last updated: ${new Date(page.updatedAt).toLocaleDateString("en-NG")}`}
    />
  );
}

export async function generateMetadata() {
  const page = await getCmsPage("sustainability", { preview: true });
  return cmsPageMetadata(page);
}
