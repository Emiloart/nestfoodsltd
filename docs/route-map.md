# Route Map

## Public Website

| Route | Purpose |
| --- | --- |
| `/` | Homepage with hero, trust strip, product range, production standards, about, vision, careers, and contact sections. |
| `/shop` | De-Nest Bread product catalogue. |
| `/products/[slug]` | Product detail pages with description, ingredients, allergens, nutrition notes, size formats, and enquiry CTA. |
| `/about` | Company story for Nest Foods Limited. |
| `/vision` | Mission, vision, and values. |
| `/careers` | Roles, HR contact, email-prep application form, and equal opportunity statement. |
| `/contact` | Official phones, emails, WhatsApp numbers, business hours, map link, contact locations, and confirmed social channels. |
| `/privacy` | Consent preferences and NDPR data requests. |
| `/terms` | Website terms placeholder. |

## Public API

| Route | Purpose |
| --- | --- |
| `/api/search` | Product and category search suggestions. |
| `/api/chat/ask` | Corporate chat assistant. |
| `/api/chat/leads` | Enquiry handoff capture. |
| `/api/privacy/consent` | Consent preference storage. |
| `/api/privacy/data-requests` | NDPR request intake. |
| `/api/health` | Runtime health. |
| `/api/telemetry/errors` | Client error intake. |
| `/api/telemetry/web-vitals` | Web vitals intake. |

## Admin Routes

Admin routes are available only on configured admin hosts.

| Route | Purpose |
| --- | --- |
| `/admin` | Operations dashboard. |
| `/admin/login` | Admin login. |
| `/admin/content` | Editable CMS pages. |
| `/admin/banners` | Hero/banner management. |
| `/admin/media` | Media metadata and usage references. |
| `/admin/catalog` | Corporate product catalogue manager. |
| `/admin/users` | Admin user directory. |
| `/admin/audit` | Audit events. |
| `/admin/ops` | Runtime operations summary. |
