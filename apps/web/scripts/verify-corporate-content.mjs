import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(scriptDir, "..");
const repoRoot = path.resolve(appRoot, "../..");

function fail(message) {
  throw new Error(message);
}

function countOccurrences(input, pattern) {
  return input.match(new RegExp(pattern, "g"))?.length ?? 0;
}

async function readText(relativePath) {
  return readFile(path.join(repoRoot, relativePath), "utf8");
}

async function verifyHomepageSections() {
  const page = await readText("apps/web/app/page.tsx");
  const sections = [
    "HomeHeroSection",
    "HomeTrustStrip",
    "HomeProductRangeSection",
    "HomeProductionStandardsSection",
    "HomeStorySection",
    "HomeContactSection",
    "HomeCareersSection",
    "HomeNewsletterEnquirySection",
  ];

  for (const section of sections) {
    const renderedCount = countOccurrences(page, `<${section}\\b`);
    if (renderedCount !== 1) {
      fail(`${section} must render exactly once on the homepage. Found ${renderedCount}.`);
    }
  }
}

async function verifySingleFooter() {
  const footer = await readText("apps/web/components/footer.tsx");
  const footerCount = countOccurrences(footer, "<footer\\b");
  if (footerCount !== 1) {
    fail(`Footer component must contain exactly one footer element. Found ${footerCount}.`);
  }
  if (footer.includes("md:hidden") && footer.includes("hidden")) {
    fail("Footer should not maintain separate mobile/desktop footer blocks.");
  }
}

async function verifyCatalogueIngredients() {
  const raw = await readText("apps/web/data/catalog.json");
  const data = JSON.parse(raw);
  const expectedProducts = new Set([
    "De-Nest Family Jumbo Bread",
    "De-Nest Family Loaf Bread",
    "De-Nest Midi Bread",
    "De-Nest Mini Bread",
  ]);
  const expectedIngredients = [
    "Enriched wheat flour",
    "Water",
    "Sugar",
    "Vegetable oil",
    "Yeast",
    "Salt",
    "Milk",
    "Butter",
  ];

  for (const productName of expectedProducts) {
    if (!data.products.some((product) => product.name === productName)) {
      fail(`Missing product: ${productName}.`);
    }
  }

  for (const product of data.products) {
    for (const ingredient of expectedIngredients) {
      if (!product.ingredients?.includes(ingredient)) {
        fail(`${product.name} is missing ingredient: ${ingredient}.`);
      }
    }
  }
}

async function verifyLocationFallbacks() {
  const contactSource = await readText("apps/web/lib/company/contact.ts");
  for (const required of [
    "Aba Contact Location",
    "Akwa-Ibom Contact Location",
    "Phone contact was not supplied in the PDF source.",
    "Address and phone contact were not supplied in the PDF source.",
  ]) {
    if (!contactSource.includes(required)) {
      fail(`Missing location fallback note: ${required}`);
    }
  }

  const locationFinder = await readText("apps/web/components/locations/location-finder.tsx");
  if (!locationFinder.includes("displayValue")) {
    fail("LocationFinder must use displayValue fallbacks for incomplete PDF branch data.");
  }
}

await verifyHomepageSections();
await verifySingleFooter();
await verifyCatalogueIngredients();
await verifyLocationFallbacks();

console.log("Corporate content regression checks passed.");
