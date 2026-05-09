import { HomeCareersSection } from "@/components/home/home-careers-section";
import { HomeContactSection } from "@/components/home/home-contact-section";
import { HomeHeroSection } from "@/components/home/home-hero-section";
import { HomeNewsletterEnquirySection } from "@/components/home/home-newsletter-enquiry-section";
import { HomeProductionStandardsSection } from "@/components/home/home-production-standards-section";
import { HomeProductRangeSection } from "@/components/home/home-product-range-section";
import { HomeStorySection } from "@/components/home/home-story-section";
import { HomeTrustStrip } from "@/components/home/home-trust-strip";
import { listCatalogueProducts } from "@/lib/catalog/service";
import { cmsPageMetadata } from "@/lib/cms/metadata";
import { getCmsPage } from "@/lib/cms/service";

export default async function HomePage() {
  const [homePage, contactPage, careersPage, products] =
    await Promise.all([
      getCmsPage("home"),
      getCmsPage("contact"),
      getCmsPage("careers"),
      listCatalogueProducts(),
    ]);

  return (
    <div className="grain-background pb-10">
      <HomeHeroSection page={homePage} />
      <HomeTrustStrip />
      <HomeProductRangeSection products={products} />
      <HomeProductionStandardsSection />
      <HomeStorySection />
      <HomeContactSection contactPage={contactPage} />
      <HomeCareersSection careersPage={careersPage} />
      <HomeNewsletterEnquirySection />
    </div>
  );
}

export async function generateMetadata() {
  const page = await getCmsPage("home", { preview: true });
  return cmsPageMetadata(page, { path: "/" });
}
