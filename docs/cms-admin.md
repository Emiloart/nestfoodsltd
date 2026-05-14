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

Daily admin access should use managed admin users where configured. SUPER_ADMIN can rotate role access tokens from `/admin/users`; once a managed token is set for a role, the old environment token is no longer accepted for normal token login for that role.
