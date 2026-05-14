import { HomeCareersSection } from "@/components/home/home-careers-section";
import { HomeBannerSection } from "@/components/home/home-banner-section";
import { HomeContactSection } from "@/components/home/home-contact-section";
import { HomeHeroSection } from "@/components/home/home-hero-section";
import { HomeNewsletterEnquirySection } from "@/components/home/home-newsletter-enquiry-section";
import { HomeProductionStandardsSection } from "@/components/home/home-production-standards-section";
import { HomeProductionVideoSection } from "@/components/home/home-production-video-section";
import { HomeProductRangeSection } from "@/components/home/home-product-range-section";
import { HomeStorySection } from "@/components/home/home-story-section";
import { listCatalogueProducts } from "@/lib/catalog/service";
import { cmsPageMetadata } from "@/lib/cms/metadata";
import { getCmsBanners, getCmsPage } from "@/lib/cms/service";

export default async function HomePage() {
  const [homePage, contactPage, careersPage, banners, products] = await Promise.all([
    getCmsPage("home"),
    getCmsPage("contact"),
    getCmsPage("careers"),
    getCmsBanners(),
    listCatalogueProducts(),
  ]);

  return (
    <div className="grain-background pb-10">
      <HomeHeroSection page={homePage} />
      <HomeBannerSection banners={banners} />
      <HomeProductionVideoSection />
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
