import { HomeCareersSection } from "@/components/home/home-careers-section";
import { HomeContactSection } from "@/components/home/home-contact-section";
import { HomeDistributorTeaser } from "@/components/home/home-distributor-teaser";
import { HomeHeroSection } from "@/components/home/home-hero-section";
import { HomeInsightsSection } from "@/components/home/home-insights-section";
import { HomeProductionStandardsSection } from "@/components/home/home-production-standards-section";
import { HomeProductRangeSection } from "@/components/home/home-product-range-section";
import { HomeStorySection } from "@/components/home/home-story-section";
import { HomeTraceabilitySection } from "@/components/home/home-traceability-section";
import { HomeTrustStrip } from "@/components/home/home-trust-strip";
import { cmsPageMetadata } from "@/lib/cms/metadata";
import { getCmsBanners, getCmsPage } from "@/lib/cms/service";
import { listCommerceProducts } from "@/lib/commerce/service";
import { listBlogArticles } from "@/lib/blog/articles";

export default async function HomePage() {
  const [homePage, aboutPage, visionPage, contactPage, careersPage, banners, products] =
    await Promise.all([
      getCmsPage("home"),
      getCmsPage("about"),
      getCmsPage("vision"),
      getCmsPage("contact"),
      getCmsPage("careers"),
      getCmsBanners(),
      listCommerceProducts(),
    ]);

  const featuredBanner = banners[0];
  const featuredArticles = listBlogArticles();

  return (
    <div className="grain-background pb-10">
      <HomeHeroSection page={homePage} banner={featuredBanner} />
      <HomeTrustStrip />
      <HomeProductRangeSection products={products} />
      <HomeProductionStandardsSection />
      <HomeTraceabilitySection />
      <HomeStorySection aboutPage={aboutPage} visionPage={visionPage} />
      <HomeDistributorTeaser />
      <HomeInsightsSection articles={featuredArticles} />
      <HomeCareersSection careersPage={careersPage} />
      <HomeContactSection contactPage={contactPage} />
    </div>
  );
}

export async function generateMetadata() {
  const page = await getCmsPage("home", { preview: true });
  return cmsPageMetadata(page, { path: "/" });
}
