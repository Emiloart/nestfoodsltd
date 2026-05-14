# Route Map

## Public Website

| Route              | Purpose                                                                                                                                                                          |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                | Homepage with cinematic hero, CMS-managed banner section, brief product range, production standards, founder/story, branch/contact teaser, careers, and newsletter section.      |
| `/products`        | De-Nest Bread product catalogue.                                                                                                                                                 |
| `/products/[slug]` | Product detail pages with gallery, tabs, description, ingredients, allergens, nutrition notes, storage guidance, freshness cue, size formats, comparison table, and enquiry CTA. |
| `/about`           | Company story, founder story, mission, vision, values, milestones, production standards, and FAQ for Nest Foods Limited.                                                         |
| `/careers`         | Roles, HR contact, online application form, file attachment intake, and equal opportunity statement.                                                                             |
| `/contact`         | Official phones, emails, WhatsApp numbers, business hours, map link, contact locations, and confirmed social channels.                                                           |
| `/privacy`         | Consent preferences and NDPR data requests.                                                                                                                                      |
| `/terms`           | Legal and policy documents.                                                                                                                                                      |

Legacy `/shop` and `/vision` URLs are handled as permanent redirects to `/products` and `/about`.

## Public API

| Route                        | Purpose                                                                                               |
| ---------------------------- | ----------------------------------------------------------------------------------------------------- |
| `/api/search`                | Product and category search suggestions.                                                              |
| `/api/chat/ask`              | Corporate chat assistant.                                                                             |
| `/api/chat/leads`            | Enquiry handoff capture.                                                                              |
| `/api/privacy/consent`       | Consent preference storage.                                                                           |
| `/api/privacy/data-requests` | NDPR request intake.                                                                                  |
| `/api/newsletter/subscribe`  | Newsletter subscriber capture.                                                                        |
| `/api/enquiries/bulk`        | Product supply enquiry capture.                                                                       |
| `/api/enquiries/distributor` | Distributor-interest capture without an automated trade workflow.                                     |
| `/api/careers/apply`         | Online career application intake with applicant confirmation email when email delivery is configured. |
| `/api/health`                | Runtime health.                                                                                       |
| `/api/telemetry/errors`      | Client error intake.                                                                                  |
| `/api/telemetry/web-vitals`  | Web vitals intake.                                                                                    |

## Admin Routes

Admin routes are available only on configured admin hosts.

| Route            | Purpose                                                                  |
| ---------------- | ------------------------------------------------------------------------ |
| `/admin`         | De-Nest Bread website admin dashboard.                                   |
| `/admin/login`   | Admin login.                                                             |
| `/admin/content` | Editable CMS pages.                                                      |
| `/admin/banners` | Homepage banner image, publishing, ordering, and action-link management. |
| `/admin/media`   | Media metadata and usage references.                                     |
| `/admin/catalog` | Corporate product catalogue manager.                                     |
| `/admin/users`   | Admin user directory, invites, MFA policy, and access-token rotation.    |
| `/admin/audit`   | Audit events.                                                            |
| `/admin/ops`     | Runtime operations summary.                                              |
