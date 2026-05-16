# CMS And Admin

## CMS Pages

Editable pages:

- Home
- About
- Careers
- Contact

Each CMS page supports:

- title
- headline
- description
- status and publish date
- primary and secondary CTA labels and links
- hero image
- optional hero video URL and poster
- logo image
- SEO title, description, and image
- revisions

## Banners

Banners support homepage hero messaging and CTA surfaces.

## Company Controls

`/admin/company` is the non-developer control panel for public business details:

- official phone, email, WhatsApp, and map links
- confirmed social media links
- About story, mission, vision, founder story, and core values
- careers intro, HR contact, roles, and application requirements
- branch/contact locations and business hours
- trust certifications, milestones, compliance text, and FAQ content

Set `COMPANY_STORAGE_DRIVER=postgres` with `DATABASE_URL` in production so these edits persist in Neon.

## Media

Media assets support:

- image or video kind
- URL
- alt text
- optional poster image
- folder
- usage references

## Catalogue Manager

Admins edit only corporate catalogue fields:

- product name
- slug
- status
- category
- short description
- detailed description
- image and gallery uploads or URLs
- ingredients
- allergens
- nutrition notes
- pack or size formats

## Admin Roles

- `SUPER_ADMIN`
- `CONTENT_EDITOR`
- `SALES_MANAGER`

Daily admin access should use managed admin users where configured. SUPER_ADMIN can rotate role access tokens from `/admin/users`; the environment token remains accepted as a break-glass fallback until it is changed or removed in Vercel.
Invited users should use the generated activation link first; after activation, the login page signs them in with the password and MFA code they set.
