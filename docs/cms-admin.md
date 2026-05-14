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
- image and gallery URLs
- ingredients
- allergens
- nutrition notes
- pack or size formats

## Admin Roles

- `SUPER_ADMIN`
- `CONTENT_EDITOR`
- `SALES_MANAGER`

Daily admin access should use managed admin users where configured. SUPER_ADMIN can rotate role access tokens from `/admin/users`; the environment token remains accepted as a break-glass fallback until it is changed or removed in Vercel.
