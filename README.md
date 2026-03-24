# Vehicle Logistics Mobile

Internal vehicle tracking web app. Mobile-first, Hebrew UI (with English toggle) and RTL support.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **next-intl** (Hebrew + English i18n)
- **googleapis** (Google Sheets API v4 + Google Drive API v3)

---

## Quick Start

### 1. Clone and install

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in `.env.local` with your values (see [Environment Variables](#environment-variables) below).

### 3. Configure your organization data

Edit **`src/config/app-config.ts`** — this is the only file you need to customize:

```ts
export const CAR_BRANDS = ['Toyota', 'Ford', ...];   // vehicle brands
export const CAR_TYPES  = ['Sedan', 'Truck', ...];   // vehicle categories
export const COMPANIES  = ['Company A', ...];         // fleet companies
export const DRIVERS    = ['Alice', 'Bob', ...];      // assignable people
```

All dropdowns support a free-text **"Add New"** option, so one-off values don't require editing this file.

### 4. Run locally

```bash
npm run dev
```

App runs at [http://localhost:3000](http://localhost:3000) — redirects to `/he/` (Hebrew) by default.

---

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```env
# Google Service Account (for Sheets read/write)
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Google Spreadsheet ID (from the spreadsheet URL)
GOOGLE_SHEETS_ID=your_spreadsheet_id

# Google Drive — OAuth2 for personal account
GOOGLE_OAUTH_CLIENT_ID=your_oauth_client_id
GOOGLE_OAUTH_CLIENT_SECRET=your_oauth_client_secret
GOOGLE_OAUTH_REFRESH_TOKEN=your_refresh_token   # run: node scripts/get-drive-token.mjs

# Root folder in Google Drive where car folders are created
GOOGLE_DRIVE_ROOT_FOLDER_ID=your_folder_id
```

---

## Google Cloud Setup

### Service Account (Google Sheets)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable **Google Sheets API** and **Google Drive API**
3. Create a Service Account → download JSON key → copy `client_email` and `private_key`
4. Share your spreadsheet with the service account email (Editor access)

### OAuth2 (Google Drive)

The app uses OAuth2 (personal account) for Drive uploads. Run once:

```bash
node scripts/get-drive-token.mjs
```

---

## Google Sheets Columns (A–Q)

The app auto-creates `Cars` and `Transfers` sheets on first use.

| Column | Field |
|--------|-------|
| A | # (auto) |
| B | Car number |
| C | Brand |
| D | Car type |
| E | Test expiry date |
| F | Mileage |
| G | Assigned to |
| H | Company |
| I | Date added |
| J | Drive folder link |
| K | Vehicle license (✓/✗) |
| L | Recruitment form (✓/✗) |
| M | Complete (✓/✗) |
| N | Cleared (✓/✗) |
| O | Filled by |
| P | Equipment present (✓/✗/—) |
| Q | Missing equipment |

After first deploy, visit `/api/init` once to write column headers to an existing sheet.

---

## Deployment (Vercel)

1. Push this repo to GitHub
2. [vercel.com](https://vercel.com) → New Project → Import repo
3. Add all environment variables in **Settings → Environment Variables**
4. Deploy
5. Visit `https://your-app.vercel.app/api/init` once to initialize sheet headers

---

## i18n

| Locale | URL | Direction |
|--------|-----|-----------|
| Hebrew (default) | `/he/` | RTL |
| English | `/en/` | LTR |

A language toggle button (**HE / EN**) is visible in the header on every page.

Translation strings live in `messages/he.json` and `messages/en.json`.

---

## App Features

- **Add Car** — 3-step form: license plate → details → photos (license doc, recruitment form, car photos)
- **Transfer Car** — search by plate, reassign to new person, logs transfer history
- **Clear Car** — upload clearance form; marks car as cleared in Sheets, or saves to shared folder if car not found
- **Google Drive** — auto-creates a folder per car, uploads all photos
- **Google Sheets** — all data stored in Cars + Transfers sheets
- **Mobile-first** — optimized for phones, works in Android/iOS browser

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                        # Root layout (metadata only)
│   ├── [locale]/
│   │   ├── layout.tsx                    # Locale layout (lang, dir, i18n provider)
│   │   ├── page.tsx                      # Home screen
│   │   ├── add-car/page.tsx              # Add car form
│   │   ├── transfer-car/page.tsx         # Transfer car form
│   │   └── zikhuy-car/page.tsx           # Clear car form
│   └── api/
│       ├── cars/route.ts                 # GET all cars, POST new car
│       ├── cars/[carNumber]/route.ts     # GET one car, PUT transfer
│       ├── zikhuy/route.ts               # POST clear car
│       └── init/route.ts                 # Initialize sheet headers (run once)
├── components/
│   ├── Header.tsx          # App header with logo + language switcher
│   ├── PhotoUpload.tsx     # Camera/gallery upload with delete button
│   ├── SelectWithCustom.tsx
│   └── Toast.tsx
├── config/
│   └── app-config.ts       # ← EDIT THIS: car brands, types, companies, drivers
├── i18n/
│   ├── routing.ts          # Locale list and default locale
│   └── request.ts          # next-intl server config
├── lib/
│   ├── google-sheets.ts    # All Sheets API operations
│   ├── google-drive.ts     # All Drive API operations
│   └── utils.ts
├── middleware.ts            # next-intl locale routing
└── navigation.ts            # Locale-aware Link, useRouter, usePathname
messages/
├── he.json                  # Hebrew translations
└── en.json                  # English translations
```
