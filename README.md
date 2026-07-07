# LilamBazzar 🔨

An **auction + e-commerce marketplace** where vendors list products either at a **fixed price** (buy instantly) or as a **timed auction** (customers bid, the highest bidder wins and checks out at their winning bid price).

| Layer | Tech |
|---|---|
| Backend (`back-end/`) | NestJS 11, Prisma ORM, PostgreSQL, JWT auth, Cloudinary (images), `@nestjs/schedule` (auction-winner cron) |
| Frontend (`frontend/`) | Vite + React 19, React Router 7, Axios, hand-rolled CSS design system (no UI framework) |

---

## How the platform works

### Roles

- **Customer** — browses the marketplace, bids on live auctions, buys fixed-price items, tracks orders.
- **Vendor** — registers with an organization name + PAN number, creates listings (fixed price or auction), tracks sales.
- **Admin** — manages categories, all orders (status transitions), and user accounts.

### The auction lifecycle

```
Vendor creates auction listing          Customers bid                Cron (every minute)            Winner checks out
┌─────────────────────────┐   ┌──────────────────────────────┐   ┌───────────────────────┐   ┌──────────────────────────┐
│ base_price, start/end   │──▶│ bid ≥ current + min_increment │──▶│ end_time passed?      │──▶│ POST /orders with bid_id │
│ time, min_increment     │   │ auction.current_price updates │   │ highest bidder becomes│   │ pays winning bid price   │
└─────────────────────────┘   └──────────────────────────────┘   │ winner, is_active=off │   └──────────────────────────┘
                                                                  └───────────────────────┘
```

There is no WebSocket layer — the frontend **polls** the product endpoint every 15 s while an auction is live, and the backend cron finalizes winners within ~1 minute of the end time.

### The fixed-price flow

Customer adds items to the cart (stored in `localStorage`) → checkout → `POST /orders` with the item list and a payment method (`cod` today; `khalti` / `esewa` are placeholders until a real gateway is integrated — they mark the order's payment as *pending*).

---

## Running the project

### Prerequisites

- Node.js 20+
- A running PostgreSQL database
- A [Cloudinary](https://cloudinary.com) account (free tier is fine) for image uploads

### 1. Backend

```bash
cd back-end
npm install
```

Create `back-end/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/lilambazzar"
PORT=5000
JWT_SECRET="any-long-random-string"
CLOUDINARY_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
# optional — defaults to http://localhost:5173
FRONTEND_URL="http://localhost:5173"
```

Apply the schema, seed the admin account, and start:

```bash
npx prisma migrate dev   # creates/updates the database tables
npx prisma db seed       # creates the default admin account (see below)
npm run start:dev        # API on http://localhost:5000
```

> **Default admin** (admins can't self-register through the UI):
> `admin@lilambazzar.com` / `Admin@123` — change the password after first login.

### 2. Frontend

```bash
cd frontend
npm install
```

(Optional) create `frontend/.env` — see `frontend/.env.example`:

```env
VITE_API_URL=http://localhost:5000
```

Start it:

```bash
npm run dev              # app on http://localhost:5173
```

## How the website works — walkthrough by role

Each role has its own landing page after login: **vendors** land on *My Listings*, **admins** on *Order management*, and **customers** on the marketplace.

### 🏪 Vendor flow (selling)

1. **Sign up** and choose **"Sell products"** — organization name + PAN number are required for vendors.
2. You land on **My Listings** → click **+ New listing**.
3. Pick the selling format:
   - **Fixed price** — set a price and stock, customers buy instantly.
   - **Auction** — set a starting price, minimum bid increment, and a start/end time.
4. Pick a **category** — if none exist yet, choose **"➕ Add new category…"** right inside the form, type a name and hit **Add**. The category is created on the spot and selected (no admin needed).
5. Add photos and publish. Track buyers and revenue under **Sales**.

### 🛍️ Customer flow (bidding & buying)

1. **Sign up** with **"Shop & bid"** (or just browse — the marketplace is public).
2. On a **fixed-price** item: choose a quantity, **Buy now** or **Add to cart**, then check out with Cash on Delivery (Khalti/eSewa are placeholders for now).
3. On a **live auction**: watch the countdown, and place a bid of at least *current price + minimum increment*. The bid history updates as others bid (the page polls every 15 s).
4. Track all your auctions under **My Bids** — you'll see whether you're **Leading**, **Outbid**, or (after the auction ends and the winner cron runs, ≤ 1 minute) **Won 🎉** or **Lost**.
5. If you won, click **Checkout** — the item is ordered at your winning bid price. All purchases appear under **My Orders**, where you can also cancel while an order is still pending/confirmed.

### 🛡️ Admin flow (managing)

1. Log in with the **seeded admin account** (`admin@lilambazzar.com` / `Admin@123` — created by `npx prisma db seed`). Admins cannot self-register from the sign-up page by design.
2. You land on **Order management**: move any order through *pending → confirmed → shipped → delivered* (or cancel). Delivering an order automatically stamps the delivery date.
3. **Categories**: full CRUD with images (vendors can also create plain categories inline while listing).
4. **Users**: view everyone on the platform and delete accounts.

---

## Repository layout

```
LilamBazzar/
├── back-end/          NestJS API — see back-end/README.md for the full endpoint reference
│   ├── prisma/        schema.prisma (User, Category, Product, Auction, Bid, Order, …)
│   └── src/
│       ├── auth/      register/login/profile (JWT, bcrypt)
│       ├── users/     user CRUD
│       ├── categories/ category CRUD (+ Cloudinary upload)
│       ├── products/  vendor listings + public /products/browse catalog
│       ├── bids/      place bid, history, my-bids
│       ├── orders/    checkout, my-orders, my-sales, admin status updates
│       ├── cron/      auction winner selection (every minute)
│       └── cloudinary/ image upload service (base64 → Cloudinary URL)
└── frontend/          Vite + React SPA
    └── src/
        ├── api/       axios client + auth header + error normalizer
        ├── context/   Auth (JWT), Cart (localStorage), Toast providers
        ├── components/ Navbar, ProductCard, Countdown, ImageUploader, …
        └── pages/     Browse, ProductDetail (bidding), Checkout, MyBids,
                       MyOrders, Profile, vendor/* (listings, sales),
                       admin/* (orders, categories, users)
```

## Frontend page map

| Route | Who | What |
|---|---|---|
| `/` | public | Marketplace: search, category & auction/fixed filters |
| `/products/:id` | public | Gallery, description; live **bid panel** with countdown, bid history & polling; buy/add-to-cart for fixed price |
| `/login`, `/register` | public | Auth (register as shopper or vendor). After login users are routed by role: admin → `/admin/orders`, vendor → `/vendor/products`, customer → `/` |
| `/checkout` | signed in | Cart checkout, or auction-win claim (`?bid_id=&product_id=`) |
| `/my-bids` | signed in | Per-auction summary: leading / outbid / finalizing / won / lost, with checkout for wins |
| `/my-orders` | signed in | Order history, statuses, cancel while pending/confirmed |
| `/profile` | signed in | Edit own profile |
| `/vendor/products` (+ `/new`, `/:id/edit`) | vendor | Listing management with image upload, auction scheduling & inline category creation |
| `/vendor/sales` | vendor | Revenue stats + sold line-items with buyer info |
| `/admin/orders` | admin | All orders, status transitions (pending → … → delivered) |
| `/admin/categories` | admin | Category CRUD with images |
| `/admin/users` | admin | User list + delete |

## Backend changes made while building the frontend

These were required for a browser frontend to work at all (details in `back-end/README.md`):

1. **CORS enabled** in `main.ts` (origin from `FRONTEND_URL`, default `http://localhost:5173`).
2. **JSON body limit raised to 15 MB** — images travel as base64 strings inside JSON.
3. **Login bug fixed** — the bcrypt `compare()` was missing `await`, so wrong passwords were accepted.
4. **JWT payload no longer contains the hashed password** on login.
5. **`GET /orders/my-orders` fixed** — filtered by `id` instead of `user_id`, returning wrong results.
6. **New public catalog endpoints** — `GET /products/browse` (with `category_id` / `is_auction` / `search` query params) and `GET /products/browse/:id`; `GET /categories` made public. Previously `GET /products` only returned the *authenticated vendor's own* products, so customers had no way to discover anything.
7. **New admin endpoint** — `GET /orders` (admin only) so the order-management dashboard can list all orders.

## Known limitations

- **Payments**: `khalti` / `esewa` are placeholder values — no real gateway/webhook integration yet; only `cod` completes end-to-end.
- **Real-time**: auction updates are poll-based (15 s on the product page); winners are finalized by a 1-minute cron, not pushed.
- **Role enforcement**: several backend routes (categories, users) rely on UI-level restriction rather than server-side role guards.
