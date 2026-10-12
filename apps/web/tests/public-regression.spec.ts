import { test, expect } from "@playwright/test";
import catalogue from "../data/catalog.json";
import { normalizeCurrentCatalogueProducts } from "../lib/catalog/current-products";
import { type CatalogueData } from "../lib/catalog/types";

let pageErrors: string[];
test.beforeEach(async ({ page }) => {
  pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.route("https://www.google.com/maps**", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: "<html><title>Map omitted in local interaction checks</title></html>",
    }),
  );
});
test.afterEach(() => {
  expect(pageErrors).toEqual([]);
});

test("desktop navigation remains usable after scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/products", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => window.scrollTo(0, 900));
  const nav = page.getByRole("navigation", { name: "Primary navigation" });
  await expect(nav.getByRole("link", { name: "Products", exact: true })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Products", exact: true })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await nav.getByRole("link", { name: "About", exact: true }).click();
  await expect(page).toHaveURL(/\/about$/);
});

test("mobile navigation traps focus and restores its trigger", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/products", { waitUntil: "domcontentloaded" });
  const trigger = page.getByRole("button", { name: "Open navigation" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Mobile navigation", exact: true });
  await expect(dialog).toBeVisible();
  for (let i = 0; i < 9; i++) {
    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => Boolean(document.activeElement?.closest("dialog")))).toBe(
      true,
    );
  }
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test("mobile consent choices have clear space and closed contact links cannot receive focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/privacy", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("button", { name: /^Essential only$/i })).toBeVisible();
  await expect(page.getByRole("button", { name: "Open contact options" })).toHaveCount(0);
  await page.getByRole("button", { name: /^Essential only$/i }).click();
  const trigger = page.getByRole("button", { name: "Open contact options" });
  await expect(trigger).toBeVisible();
  await page
    .locator("#floating-contact-options a")
    .first()
    .evaluate((link: HTMLAnchorElement) => link.focus());
  expect(
    await page.evaluate(() => document.activeElement?.closest("#floating-contact-options")),
  ).toBeNull();
  await trigger.click();
  await expect(page.locator("#floating-contact-options")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(page.locator("#floating-contact-options")).not.toBeVisible();
});

test("privacy requests recover from a network failure without clearing the email", async ({
  page,
}) => {
  await page.route("**/api/privacy/data-requests", (route) => route.abort());
  await page.goto("/privacy", { waitUntil: "domcontentloaded" });
  await page.getByLabel("Email address (required)", { exact: true }).fill("audit@example.invalid");
  await page.getByRole("button", { name: /^Submit data request$/i }).click();
  await expect(page.getByRole("button", { name: /^Submit data request$/i })).toBeEnabled();
  await expect(page.getByText("Your request could not be sent.", { exact: false })).toBeVisible();
  await expect(page.getByLabel("Email address (required)", { exact: true })).toHaveValue(
    "audit@example.invalid",
  );
});

test("a successful supply enquiry clears the form", async ({ page }) => {
  await page.route("**/api/enquiries/bulk", (route) =>
    route.fulfill({ status: 201, json: { lead: { id: "synthetic-enquiry" } } }),
  );
  await page.goto("/contact", { waitUntil: "domcontentloaded" });
  await page.getByLabel("Full name (required)", { exact: true }).fill("Audit Person");
  await page.getByLabel("Phone or WhatsApp (required)", { exact: true }).fill("08000000000");
  await page.getByRole("button", { name: /^Send Supply Enquiry$/i }).click();
  await expect(page.getByLabel("Full name (required)", { exact: true })).toHaveValue("");
  await expect(
    page.getByText("Thank you. Your enquiry was submitted", { exact: false }),
  ).toBeVisible();
});

test("server validation points to the relevant enquiry field", async ({ page }) => {
  await page.route("**/api/enquiries/bulk", (route) =>
    route.fulfill({
      status: 400,
      json: { details: { fieldErrors: { fullName: ["Enter at least two characters."] } } },
    }),
  );
  await page.goto("/contact", { waitUntil: "domcontentloaded" });
  const name = page.getByLabel("Full name (required)", { exact: true });
  await name.fill(" A ");
  await page.getByLabel("Phone or WhatsApp (required)", { exact: true }).fill("08000000000");
  await page.getByRole("button", { name: /^Send Supply Enquiry$/i }).click();
  await expect(name).toHaveAttribute("aria-invalid", "true");
  await expect(name).toBeFocused();
  await expect(page.getByText("Enter at least two characters.", { exact: true })).toBeVisible();
});

test("product gallery contains keyboard focus and returns it on close", async ({ page }) => {
  await page.goto("/products/de-nest-family-jumbo-bread", { waitUntil: "domcontentloaded" });
  const trigger = page.getByRole("button", { name: /Open product image gallery/ });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: /image gallery$/ });
  await expect(dialog).toBeVisible();
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => Boolean(document.activeElement?.closest("dialog")))).toBe(
      true,
    );
  }
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test("career uploads reject bad formats, extra files and excessive total size", async ({
  request,
}, testInfo) => {
  async function submit(files: { name: string; type: string; bytes: string | Uint8Array }[]) {
    const form = new FormData();
    form.set("fullName", "Audit Person");
    form.set("phone", "08000000000");
    form.set("email", "audit@example.invalid");
    form.set("position", "Audit Role");
    for (const file of files)
      form.append(
        "files",
        new File(
          [typeof file.bytes === "string" ? file.bytes : new Uint8Array(file.bytes)],
          file.name,
          { type: file.type },
        ),
      );
    return fetch("http://127.0.0.1:3100/api/careers/apply", {
      method: "POST",
      headers: {
        origin: "http://127.0.0.1:3100",
        "x-forwarded-for": `192.0.2.${testInfo.retry + 1}`,
      },
      body: form,
    });
  }
  expect(
    (await submit([{ name: "bad.html", type: "text/html", bytes: "<html>not a CV</html>" }]))
      .status,
  ).toBe(400);
  expect(
    (
      await submit(
        Array.from({ length: 5 }, (_, i) => ({
          name: `cv-${i}.pdf`,
          type: "application/pdf",
          bytes: "%PDF-1.7\n%%EOF",
        })),
      )
    ).status,
  ).toBe(400);
  expect((await submit([])).status).toBe(400);
  expect(
    (
      await submit([
        { name: "renamed.pdf", type: "application/pdf", bytes: "<html>not a PDF</html>" },
      ])
    ).status,
  ).toBe(400);
  expect(
    (
      await submit(
        Array.from({ length: 2 }, (_, i) => ({
          name: `large-${i}.pdf`,
          type: "application/pdf",
          bytes: new Uint8Array(2.5 * 1024 * 1024),
        })),
      )
    ).status,
  ).toBe(400);
  const valid = await submit([
    { name: "cv.pdf", type: "application/pdf", bytes: "%PDF-1.7\n%%EOF" },
  ]);
  expect(valid.status).toBe(201);
  expect((await valid.json()).emailDelivery.internal.status).toBe("skipped");
  expect((await request.get("/products")).status()).toBe(200);
});

test("catalogue filters survive refresh, browser back and clearing", async ({ page }) => {
  await page.goto("/products");
  await page.getByRole("button", { name: /^Essential only$/i }).click();
  await page.getByRole("button", { name: "Mini Bread", exact: true }).click();
  await expect(page).toHaveURL(/category=Mini/);
  await expect(page.locator("article")).toHaveCount(1);
  await page.getByLabel("Sort", { exact: true }).selectOption("name");
  await page.reload();
  await expect(page.getByRole("button", { name: "Mini Bread", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByLabel("Sort", { exact: true })).toHaveValue("name");
  await page.getByRole("button", { name: "All", exact: true }).click();
  await expect(page.locator("article")).toHaveCount(5);
  await page.goBack();
  await expect(page.locator("article")).toHaveCount(1);
  await page.getByRole("button", { name: /^Clear filters$/i }).click();
  await expect(page.locator("article")).toHaveCount(5);
  await page.getByLabel("Search catalogue", { exact: true }).fill("no-product-with-this-name");
  await expect(page.getByText("No products matched", { exact: false })).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Search catalogue", { exact: true })).toHaveValue(
    "no-product-with-this-name",
  );
  await page.getByRole("button", { name: /^Clear filters$/i }).click();
  await expect(page.getByLabel("Search catalogue", { exact: true })).toHaveValue("");
});

test("product enquiry retains the chosen product on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/products/de-nest-family-jumbo-bread");
  await page.getByRole("button", { name: /^Essential only$/i }).click();
  await page.getByRole("link", { name: /^Make Enquiry$/i }).click();
  await expect(page).toHaveURL(/contact\?product=de-nest-family-jumbo-bread#enquiry$/);
  await expect(page.getByLabel("Product of interest (optional)", { exact: true })).toHaveValue(
    "De-Nest Family Jumbo Bread",
  );
});

test("product details support arrow keys and announced panels", async ({ page }) => {
  await page.goto("/products/de-nest-family-jumbo-bread");
  const description = page.getByRole("tab", { name: "Description", exact: true });
  await description.focus();
  await page.keyboard.press("ArrowRight");
  const ingredients = page.getByRole("tab", { name: "Ingredients", exact: true });
  await expect(ingredients).toBeFocused();
  await expect(ingredients).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel", { name: "Ingredients", exact: true })).toBeVisible();
  await page.keyboard.press("End");
  await expect(page.getByRole("tab", { name: "Storage", exact: true })).toBeFocused();
  await page.keyboard.press("Home");
  await expect(description).toBeFocused();
});

test("global search supports keyboard selection and recovers from network failure", async ({
  page,
}) => {
  await page.goto("/products");
  const search = page.getByRole("combobox", {
    name: "Search De-Nest Bread products and product information",
  });
  await search.fill("jumbo");
  await expect(page.getByRole("option", { name: /Jumbo/ })).toBeVisible();
  await page.keyboard.press("ArrowDown");
  await expect(search).toHaveAttribute("aria-activedescendant", /.+-0$/);
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/products\/de-nest-family-jumbo-bread$/);
  await page.route("**/api/search?**", (route) => route.abort());
  await search.fill("sliced");
  await expect(page.getByText("Suggestions are unavailable", { exact: false })).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/products\?search=sliced$/);
});

test("coming-soon products explain availability and career areas prefill applications", async ({
  page,
}) => {
  await page.goto("/products/de-nest-mini-bread");
  await expect(page.getByText("Coming soon — contact our team", { exact: false })).toBeVisible();
  await expect(page.getByRole("link", { name: /^Ask about availability$/i })).toHaveAttribute(
    "href",
    /contact\?product=de-nest-mini-bread/,
  );
  await page.goto("/careers?role=Driver#application");
  // The current roles are supplied by company content, so select a listed area.
  const roleLink = page.locator('a[href^="/careers?role="]').first();
  const role = await roleLink.textContent();
  await roleLink.click();
  await expect(page.getByLabel("Position applying for (required)", { exact: true })).toHaveValue(
    role!.trim(),
  );
});

test("canonical URLs, public contact data and sitemap timestamps are consistent", async ({
  page,
  request,
}) => {
  await page.goto("/products/de-nest-family-jumbo-bread");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://www.nestfoodsltd.com/products/de-nest-family-jumbo-bread",
  );
  const organization = await page.locator("#organization-ld").textContent();
  const data = JSON.parse(organization!);
  expect(data.contactPoint.some((entry: { telephone?: string }) => entry.telephone)).toBe(true);
  expect(data.sameAs.length).toBeGreaterThan(0);
  const first = await (await request.get("/sitemap.xml")).text();
  const second = await (await request.get("/sitemap.xml")).text();
  expect(second).toBe(first);
  expect(first).toContain("https://www.nestfoodsltd.com/products");
  await page.goto("/terms");
  await expect(page.getByText("sales@nestfoodsltd@gmail.com", { exact: false })).toHaveCount(0);
});

test("legacy catalogue data retains the approved Mini and Midi presentation", () => {
  const legacy = structuredClone(catalogue) as CatalogueData;
  const mini = legacy.products.find((product) => product.slug === "de-nest-mini-bread")!;
  mini.imageUrl = "/media/products/nestfoodsltd-mini-loaf.png";
  mini.galleryUrls = [mini.imageUrl];
  mini.shortDescription = "A mini loaf.";
  mini.longDescription = "Mini loaf information.";
  delete mini.availability;
  const midi = legacy.products.find((product) => product.slug === "de-nest-midi-bread")!;
  midi.imageUrl = "/placeholders/products/product-placeholder.svg";
  midi.galleryUrls = [midi.imageUrl];
  const products = normalizeCurrentCatalogueProducts(legacy.products);
  const approvedMini = products.find((product) => product.slug === mini.slug)!;
  expect(approvedMini.availability).toBe("coming-soon");
  expect(approvedMini.imageUrl).toBe("/placeholders/products/mini-bread-coming-soon.svg");
  expect(approvedMini.galleryUrls).toEqual([approvedMini.imageUrl]);
  expect(approvedMini.shortDescription).toContain("Coming soon.");
  expect(products.find((product) => product.slug === midi.slug)!.imageUrl).toBe(
    "/media/products/nestfoodsltd-midi-loaf.png",
  );
  expect(normalizeCurrentCatalogueProducts(products)).toEqual(products);
});

for (const width of [390, 1440]) {
  test(`product images retain their full proportions and rounded edges at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/products");
    const photos = page.locator('article img:not([src$=".svg"])');
    await expect(photos).toHaveCount(4);
    for (const photo of await photos.all()) {
      await photo.scrollIntoViewIfNeeded();
      await expect
        .poll(() => photo.evaluate((image: HTMLImageElement) => image.naturalWidth))
        .toBeGreaterThan(0);
      const proportions = await photo.evaluate((image: HTMLImageElement) => {
        const box = image.getBoundingClientRect();
        return {
          ratio: box.width / box.height,
          original: image.naturalWidth / image.naturalHeight,
          fit: getComputedStyle(image).objectFit,
          radius: parseFloat(getComputedStyle(image).borderTopLeftRadius),
          frame: getComputedStyle(image.closest("article")!).backgroundColor,
        };
      });
      expect(proportions.ratio).toBeCloseTo(proportions.original, 2);
      expect(proportions.fit).toBe("contain");
      expect(proportions.radius).toBeGreaterThan(0);
      expect(proportions.frame).toBe("rgba(0, 0, 0, 0)");
    }
    const mini = page.locator("article").filter({ hasText: "De-Nest Mini Bread" });
    await expect(mini.getByRole("img")).toHaveAttribute(
      "src",
      "/placeholders/products/mini-bread-coming-soon.svg",
    );
    await expect(mini.getByText("Coming soon", { exact: true })).toBeVisible();
    await page.goto("/products/de-nest-family-jumbo-bread");
    const mainImage = page
      .getByRole("button", { name: /Open product image gallery/ })
      .getByRole("img");
    await mainImage.scrollIntoViewIfNeeded();
    const box = await mainImage.boundingBox();
    expect(box!.width / box!.height).toBeCloseTo(2 / 3, 2);
    await expect(mainImage).toHaveCSS("object-fit", "contain");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });

  test(`credential logos scroll continuously to the left without boxes at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    const credentials = page.locator("#production-standards");
    await credentials.scrollIntoViewIfNeeded();
    await expect(credentials.getByRole("img")).toHaveCount(3);
    await expect(credentials.locator("article")).toHaveCount(0);
    const track = credentials.locator(".certification-carousel-track");
    await credentials.locator(".certification-marquee").hover();
    await expect(track).toHaveCSS("animation-play-state", "running");
    const position = () =>
      track.evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).m41);
    const start = await position();
    await expect.poll(position).toBeLessThan(start - 4);
    const groups = await credentials
      .locator(".certification-logo-group")
      .evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().width));
    expect(groups[0]).toBeCloseTo(groups[1]!, 2);
    expect(groups[0]).toBeGreaterThan(Math.min(width - 48, 1200));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });

  test(`production video starts on scroll and pauses out of view at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.getByText("Play the video when you are ready.")).toHaveCount(0);
    const video = page.locator("video");
    await expect
      .poll(() => video.evaluate((element: HTMLVideoElement) => element.paused))
      .toBe(true);
    await video.scrollIntoViewIfNeeded();
    await expect
      .poll(() => video.evaluate((element: HTMLVideoElement) => element.currentTime), {
        timeout: 15_000,
      })
      .toBeGreaterThan(0.2);
    expect(
      await video.evaluate((element: HTMLVideoElement) => element.muted && element.playsInline),
    ).toBe(true);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await expect
      .poll(() => video.evaluate((element: HTMLVideoElement) => element.paused))
      .toBe(true);
  });
}
