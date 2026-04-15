# Route Map

## Public IA

- `/` Home
- `/shop` Products
- `/products/[slug]` Product details
- `/quality` Quality Standards
- `/about` About
- `/vision` Vision and mission
- `/careers` Careers
- `/contact` Contact

## Supporting Public Routes

- `/distributor-enquiry` Distributor enquiry form
- `/privacy`
- `/terms`

## Redirected Legacy Routes

- `/traceability` redirects to `/quality`
- `/b2b` redirects to `/distributor-enquiry`

## Admin / Internal Surface

- `https://admin.<domain>/admin` Admin entry
- `https://admin.<domain>/admin/login` Admin login
- `https://admin.<domain>/admin/content` Content manager
- `https://admin.<domain>/admin/banners` Banner manager
- `https://admin.<domain>/admin/catalog` Catalog manager
- `https://admin.<domain>/admin/media` Media library
- `https://admin.<domain>/admin/users` Admin user directory
- `https://admin.<domain>/admin/audit` Security audit viewer
- `https://admin.<domain>/admin/ops` Operations dashboard

## Public Support APIs

- `/api/chat/ask`
- `/api/chat/leads`
- `/api/privacy/consent`
- `/api/privacy/data-requests`
- `/api/health`

## Admin APIs

- `https://admin.<domain>/api/admin/session`
- `https://admin.<domain>/api/admin/audit/events`
- `https://admin.<domain>/api/admin/ops/summary`
- `https://admin.<domain>/api/cms/pages`
- `https://admin.<domain>/api/cms/pages/[slug]`
- `https://admin.<domain>/api/admin/cms/banners`
- `https://admin.<domain>/api/admin/cms/banners/[id]`
- `https://admin.<domain>/api/admin/catalog/products`
- `https://admin.<domain>/api/admin/catalog/products/[id]`
- `https://admin.<domain>/api/admin/cms/media`
- `https://admin.<domain>/api/admin/cms/media/[id]`
- `https://admin.<domain>/api/admin/users`
- `https://admin.<domain>/api/admin/users/[id]`
- `https://admin.<domain>/api/admin/users/invites`
- `https://admin.<domain>/api/admin/users/invites/[id]`
- `https://admin.<domain>/api/admin/users/invites/activate`

## Scope Note

Legacy commerce, customer, portal, recipe, and traceability routes may still exist in the repository while cleanup is ongoing, but they are intentionally omitted from the public route map because they are no longer part of the intended website scope.
