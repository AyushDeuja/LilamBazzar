# LilamBazzar Backend API

NestJS + Prisma + PostgreSQL API powering an **auction and e-commerce marketplace**. Vendors list products either at a **fixed price** (normal e-commerce) or as a **timed auction** (customers place bids; highest bidder wins and can then check out). This document describes the current API surface so a frontend can be built against it, and calls out gaps/bugs the frontend needs to work around.

- Base URL: `http://localhost:<PORT>` — **no global route prefix** (routes are exactly as shown below, e.g. `/auth/login`, not `/api/auth/login`).
- `PORT` comes from `.env` (defaults to `5000` in this repo's `.env`, falls back to `4000` in code if unset).
- **No Swagger/OpenAPI** is set up — this README is the source of truth for shapes.
- **CORS is enabled** for the origin in the `FRONTEND_URL` env var (defaults to `http://localhost:5173`, the Vite dev server).
- **JSON body limit is 15 MB** — image uploads travel as base64 strings inside JSON bodies.

---

## 1. Auth model — read this first

- Every route requires a valid JWT **except** `POST /auth/register` and `POST /auth/login`. There is no `@Roles()` guard system — role checks are done ad hoc inside a few controllers (noted per-route below). Assume everything else needs a token.
- Send the token as: `Authorization: Bearer <token>`
- Tokens expire in **10 days** (hardcoded server-side; ignore any `JWT_EXPIRES_IN` env value, it's unused).
- No refresh-token flow, no password-reset/OTP flow exists. Build login/logout only for now.
- The JWT payload embeds the user row (minus the password) — `id`, `name`, `email`, `user_role` etc. can be decoded client-side for display.
- **Admins cannot self-register** (the UI only offers customer/vendor). The first admin is created by the seed script: `npx prisma db seed` → `admin@lilambazzar.com` / `Admin@123` (see `prisma/seed.js`; change the password after first login).

### `POST /auth/register` — public
Body (`RegisterDto`, same as `CreateUserDto`):
```ts
{
  name: string;              // required
  email: string;             // required, valid email
  mobile: string;            // required, 5-15 chars
  password: string;          // required
  user_role?: "admin" | "vendor" | "customer";  // optional, default "customer"
  organization_name?: string; // REQUIRED if user_role = "vendor", must be omitted otherwise
  pan_no?: string;            // REQUIRED if user_role = "vendor", must be omitted otherwise
}
```
Returns: `{ token: string }`. Server rejects duplicate email / mobile / pan_no with 400.

### `POST /auth/login` — public
Body:
```ts
{ username: string; password: string }  // username = email OR mobile, either works
```
Returns: `{ token: string }`

### `GET /auth/profile` — auth required
Returns the current user (password stripped).

### `PATCH /auth/profile` — auth required
Body: any subset of the register fields (partial update of the caller's own profile).

---

## 2. Data model overview

Three product-buying flows exist on top of one `Product` table:

- **Fixed-price product**: `is_auction=false`, has `fixed_price`, buyers just place an order.
- **Auction product**: `is_auction=true`, has `base_price` (starting bid) instead of `fixed_price`, plus a linked `Auction` row (`start_time`, `end_time`, `current_price`, `min_increment`, `winner_id`). Customers place `Bid`s; a cron job closes the auction and sets a winner; the winner then creates an `Order` referencing their winning `bid_id`.

### Roles (`roleType` enum): `"admin" | "vendor" | "customer"`
- **vendor**: can create/manage their own products (fixed-price or auction), views their sales.
- **customer**: browses, bids, buys, views their own orders.
- **admin**: can update any order's status (only enforced admin-only action currently in the API).

### Key entities and fields

**User**: `id, name, email, mobile, user_role, organization_name?, pan_no?, createdAt, updatedAt` (password never returned).

**Category**: `id, category_name, category_img?, description?, createdAt, updatedAt`.

**Product**: `id, product_name, description?, stock, category_id, organization_id (vendor's user id), fixed_price? (Decimal), base_price? (Decimal, only if auction), is_auction, auction_start_time?, auction_end_time?, createdAt, updatedAt` + nested `ProductImage[]`, `auction?`, `category: { category_name }`, `user: { name, organization_name }`.

**ProductImage**: `id, product_img (URL string), product_id`.

**Auction**: `id, product_id, start_time, end_time, starting_price, current_price?, min_increment (default 10), winner_id?, is_active, createdAt, updatedAt` + nested `bids` (top 5 by amount, on product fetch).

**Bid**: `id, auction_id, bidder_id, bid_amount, createdAt`.

**Order**: `id, order_no (format "LILAM-<timestamp>-<rand>"), user_id, bid_id? (set if paid for via a won auction), total_amount, payment_method? ("khalti"|"esewa"|"cod"), payment_status ("pending"|"paid"|"failed"|"cancelled"), order_status ("pending"|"confirmed"|"shipped"|"delivered"|"cancelled"), transaction_id?, is_delivered, delivered_at?, createdAt, updatedAt` + nested `OrderHasItem[]`.

**OrderHasItem**: `id, product_id, order_id, quantity, unit_price, total_price`.

---

## 3. Endpoint reference

All endpoints below require `Authorization: Bearer <token>` unless marked **public**.

### Users — `/users`
| Method | Path | Body | Notes |
|---|---|---|---|
| POST | `/users` | `CreateUserDto` (same shape as register) | Duplicate of register; creates a user directly |
| GET | `/users` | — | List all users (password stripped) |
| GET | `/users/:id` | — | Get one user |
| PATCH | `/users/:id` | Partial `CreateUserDto` | Update any user by id (no ownership check — treat as admin-only in UI even though not enforced server-side) |
| DELETE | `/users/:id` | — | Delete user by id |

### Categories — `/categories`
No role restriction is enforced server-side on writes. The frontend uses this deliberately: **vendors create categories inline** from the listing form (`POST /categories` with just a name) when the one they need doesn't exist yet; full CRUD (images, rename, delete) lives in the admin UI.

| Method | Path | Body | Notes |
|---|---|---|---|
| POST | `/categories` | `{ category_name: string; description?: string; category_img?: string }` | `category_img` is a **base64 data-URI string** (e.g. `data:image/png;base64,...`), NOT multipart form-data — server uploads it to Cloudinary and stores the resulting URL |
| GET | `/categories` | — | **Public.** List all |
| GET | `/categories/:id` | — | **Public.** Get one |
| PATCH | `/categories/:id` | Partial of create body | `category_img` re-uploads if provided |
| DELETE | `/categories/:id` | — | Delete |

### Products — `/products`
`GET /products` and `GET /products/:id` are scoped to the **authenticated caller's own vendor products** (the vendor dashboard view). The **public marketplace catalog** lives at `/products/browse`.

| Method | Path | Body | Notes |
|---|---|---|---|
| GET | `/products/browse` | — | **Public.** Full marketplace catalog, newest first, with images/category/auction+top bids. Optional query params: `category_id` (number), `is_auction` (`true`/`false`), `search` (name contains, case-insensitive) |
| GET | `/products/browse/:id` | — | **Public.** Single product with images, auction + top-5 bids (incl. bidder names), category and vendor info |
| POST | `/products` | `CreateProductDto` (below) | **Vendor only** (403 otherwise). `organization_id` is always forced to the caller regardless of what's sent |
| GET | `/products` | — | Lists the caller's own products (vendor view), newest first, with images/category/auction+top bids |
| GET | `/products/:id` | — | One of the caller's own products (404 if not owned/found) |
| PATCH | `/products/:id` | Partial `CreateProductDto` | Vendor + owner only (403 otherwise). ⚠️ Send the **full** payload including `is_auction` — the DTO defaults it to `false`, so a partial body without it is treated as a fixed-price update |
| DELETE | `/products/:id` | — | Vendor + owner only |

`CreateProductDto`:
```ts
{
  product_name: string;         // required
  product_img?: string[];       // array of base64 data-URI strings, uploaded to Cloudinary
  description?: string;
  stock: number;                 // required, integer >= 0
  category_id?: number;
  is_auction?: boolean;          // default false
  fixed_price?: number;          // REQUIRED if is_auction=false, forbidden if true (max 2 decimals)
  base_price?: number;           // REQUIRED if is_auction=true, forbidden if false (max 2 decimals)
  auction_start_time?: string;   // ISO date, REQUIRED if is_auction=true
  auction_end_time?: string;     // ISO date, REQUIRED if is_auction=true, must be after start_time
  min_increment?: number;        // default 10, min 1
}
```

### Bids — `/bids`
| Method | Path | Body | Notes |
|---|---|---|---|
| POST | `/bids/auction/:id` | `{ bid_amount: number }` | `:id` is the **Auction id** (not product id). `bidder_id` is forced to caller |
| GET | `/bids/auction/:auctionId/history` | — | All bids on an auction, newest first, with bidder name |
| GET | `/bids/my-bids` | — | Caller's own bids, with auction/product info |

Server-side bid validation (all return 400/403/404 with a message on failure):
- Auction must exist, be flagged `is_auction`, and `is_active`.
- Current time must be within `[start_time, end_time)`.
- Bid must be `>= (current_price ?? starting_price) + min_increment`.
- Product owner cannot bid on their own product (403).
- Success response: `{ success: true, bid, new_current_price, message }`.

### Orders — `/orders`
| Method | Path | Body | Notes |
|---|---|---|---|
| POST | `/orders` | `CreateOrderDto` (below) | Checkout — fixed-price purchase, or claiming a won auction via `bid_id` |
| GET | `/orders` | — | **Admin only** (403 otherwise) — every order with customer + items, newest first |
| GET | `/orders/my-orders` | — | The caller's own orders, newest first, with items + first product image |
| GET | `/orders/my-sales` | — | Vendor's sales — returns `OrderHasItem[]` (not `Order[]`), each with parent order + buyer info |
| GET | `/orders/:id` | — | Single order; 403 if not the owner |
| PATCH | `/orders/:id/status` | `{ order_status: string }` | **Admin only** (403 otherwise). One of pending/confirmed/shipped/delivered/cancelled. Setting "delivered" auto-sets `is_delivered=true`, `delivered_at=now()` |
| PATCH | `/orders/:id/cancel` | — | Customer cancels own order; only allowed while `pending`/`confirmed` |

`CreateOrderDto`:
```ts
{
  bid_id?: number;               // set when checking out a WON auction
  items: { product_id?: number; quantity: number }[];  // quantity >= 1
  payment_method?: "khalti" | "esewa" | "cod";
}
```
Notes:
- If `bid_id` is passed, server verifies the caller actually won that auction (`auction.winner_id === caller.id`), else 400.
- Unit price: caller's winning bid amount (for the won-auction item) or `product.fixed_price` otherwise. 400 if stock insufficient or price unavailable.
- `payment_status` is set to `"paid"` immediately for `cod`/no payment method; `"pending"` for `khalti`/`esewa`.
- ⚠️ **No real payment gateway is integrated.** `khalti`/`esewa` are just string values right now — there's no redirect URL, webhook, or transaction verification. Don't build a real payment redirect flow yet; treat these as placeholders pending backend work.
- Success response: `{ success: true, order, message }`.

---

## 4. Image uploads (Cloudinary)

There is **no multipart/form-data file upload endpoint** anywhere (despite `multer` being a dependency, it isn't wired up). All images (`category_img`, `product_img[]`) must be sent as **base64 data-URI strings inside the JSON body** — the backend uploads them to Cloudinary and stores the resulting `secure_url`. On the frontend: read the file with `FileReader`/`toBase64`, then send the string(s) directly in the create/update payload.

---

## 5. Auctions: real-time behavior (or lack of it)

There is **no WebSocket/real-time layer**. A cron job (`AuctionWinnerCron`) runs **every minute**, finds auctions whose `end_time` has passed and `is_active=true`, picks the highest bid as winner (or leaves `winner_id` null if no bids), and sets `is_active=false`. No notification (push/email/socket) is sent to anyone.

Frontend implications:
- To know if an auction has ended/has a winner, **poll** `GET /products/:id` (check `auction.is_active` / `auction.winner_id`) or `GET /bids/auction/:id/history`.
- Expect up to a ~1 minute delay between an auction's `end_time` passing and the winner actually being set server-side.
- A winning bidder should see a way to check out via `POST /orders` with `bid_id` once they've won.

---

## 6. Environment variables (backend)

| Variable | Purpose |
|---|---|
| `PORT` | Server port |
| `JWT_SECRET` | JWT signing secret |
| `DATABASE_URL` | PostgreSQL connection string |
| `CLOUDINARY_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Cloudinary credentials for image uploads |
| `FRONTEND_URL` | Allowed CORS origin (optional, defaults to `http://localhost:5173`) |

(`JWT_EXPIRES_IN` exists in `.env` but is currently unused/dead — token expiry is hardcoded to 10 days.)

---

## 7. Fixed while building the frontend (July 2026)

These issues from the original audit have been **fixed** in this codebase:

1. ~~No CORS~~ → `app.enableCors()` with `FRONTEND_URL` origin, plus a 15 MB JSON body limit for base64 image uploads (`main.ts`).
2. ~~No public browse endpoint~~ → `GET /products/browse` + `GET /products/browse/:id` (public), `GET /categories` made public.
3. ~~`GET /orders/my-orders` filtered by the wrong field~~ → now filters by `user_id`.
4. ~~Login accepted wrong passwords~~ → missing `await` on `bcrypt.compare` fixed; the hashed password is also no longer embedded in the JWT payload.
5. (new) `GET /orders` added — admin-only list of all orders for the management dashboard.

## 8. Remaining known limitations

1. **No payment gateway integration** — treat `khalti`/`esewa` selection as UI-only for now; only `cod` behaves like a real end-to-end flow (auto marks as paid).
2. **No role guard consistency** — several routes that should probably be admin/vendor-restricted (categories, user list/update/delete) aren't enforced server-side. Enforce sensible role-based UI hiding on the frontend, but don't treat it as a security boundary.
3. **No real-time updates** — build auction countdowns/bidding UI around polling, not sockets (the frontend polls the product page every 15 s during a live auction).
