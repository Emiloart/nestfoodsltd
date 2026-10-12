import { test, expect } from "@playwright/test";

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
