import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Legal & Policy Documents",
  description:
    "Terms, refund and returns policy, delivery policy, and general business policy for Nest Foods Limited.",
  path: "/terms",
});

const policies = [
  {
    title: "Terms and Conditions",
    paragraphs: [
      "By accessing or using our website and services, you agree to comply with our terms and conditions. These include proper use of our content, adherence to purchase guidelines offline, and respect for our intellectual property.",
      "Nest Foods Limited reserves the right to update these terms as necessary.",
    ],
  },
  {
    title: "Refund and Returns Policy",
    paragraphs: [
      "The company strictly disapproves refund of payment. Instead, a different delivery or pick-up schedule can be arranged to address the customer's specific need and scenario.",
      "Due to the perishable nature of our products, returns or replacements are only considered in cases of verifiable market issues or order discrepancies.",
      "Customers are encouraged to procure within reasonable capacities and report concerns promptly to enable swift resolution.",
    ],
  },
  {
    title: "Delivery Policy",
    paragraphs: [
      "We operate shop-to-shop delivery of our products to support timely and efficient movement of fresh products. Delivery timelines may vary based on location and volume.",
      "Most wholesalers also pick up directly from the company or arrange suitable logistics with the company through 08061542462 or sales@nestfoodsltd@gmail.com.",
      "Nest Foods Limited has trusted distribution channels to ensure that products reach customers fresh and in optimal condition.",
    ],
  },
  {
    title: "General Business Policy",
    paragraphs: [
      "Nest Foods Limited aligns its business operations with established food industry practices.",
    ],
    bullets: [
      "Compliance with national food safety regulations",
      "Ethical sourcing of raw materials",
      "Environmentally responsible production practices",
      "Transparent business operations and accountability",
    ],
  },
];

export default function TermsPage() {
  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 px-4 py-16 md:px-6">
      <div className="section-frame px-5 py-7 sm:px-6 sm:py-8">
        <Badge>Legal</Badge>
        <h1 className="display-heading mt-4 text-4xl text-neutral-900 sm:text-5xl">
          Legal & Policy Documents
        </h1>
        <p className="pretty-text mt-4 max-w-3xl text-[0.98rem] leading-7 text-neutral-600">
          Website terms, offline purchase expectations, product delivery policy, and general
          business commitments for Nest Foods Limited.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {policies.map((policy) => (
          <Card key={policy.title} className="space-y-3">
            <p className="section-kicker">{policy.title}</p>
            {policy.paragraphs.map((paragraph) => (
              <p key={paragraph} className="pretty-text text-sm leading-7 text-neutral-700">
                {paragraph}
              </p>
            ))}
            {policy.bullets ? (
              <ul className="space-y-2 text-sm leading-7 text-neutral-700">
                {policy.bullets.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            ) : null}
          </Card>
        ))}
      </div>
    </section>
  );
}
