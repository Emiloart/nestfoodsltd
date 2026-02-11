import { PageShell } from "@/components/page-shell";
import { getCmsPage } from "@/lib/cms/service";

export default async function ContactPage() {
  const page = await getCmsPage("contact");

  return (
    <PageShell
      title={page.title}
      headline={page.headline}
      description={page.description}
      nextStep={`Last updated: ${new Date(page.updatedAt).toLocaleDateString("en-NG")}`}
    />
  );
}
