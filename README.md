# ניהול רכבים / Vehicle Logistics Mobile

Internal vehicle tracking web app. Mobile-first, bilingual Hebrew + Russian. RTL support for Hebrew.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **googleapis** (Google Sheets API v4 + Google Drive API v3)

---

## Setup Instructions

### 1. Google Cloud Project & Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Enable these APIs:
   - **Google Sheets API**
   - **Google Drive API**
4. Go to **IAM & Admin → Service Accounts** → Create Service Account
5. Give it any name (e.g., `vehicle-logistics-sa`)
6. Click the service account → **Keys** tab → **Add Key** → **Create new key** → JSON
7. Download the JSON key file — you'll need `client_email` and `private_key` from it

### 2. Google Sheets Setup

1. Create a new Google Spreadsheet at [sheets.google.com](https://sheets.google.com)
2. Create two sheets (tabs) named exactly:
   - `Cars`
   - `Transfers`
3. Share the spreadsheet with the service account email (give **Editor** access)
4. Copy the Spreadsheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID_HERE/edit
   ```

The app will automatically create headers in both sheets on first use.

**Cars sheet columns (A–I):**
| Column | Field |
|--------|-------|
| A | מספר רכב / Номер машины |
| B | סוג רכב / Тип машины |
| C | תוקף טסט / Токеф тест |
| D | ק"מ / Километраж |
| E | שייך ל / Кому относится |
| F | תאריך הוספה / Дата добавления |
| G | קישור לתיקייה / Ссылка на папку (HYPERLINK formula) |
| H | רישיון רכב / Ришаен рехев (✓ / ✗) |
| I | הושלם / Заполнено (✓ / ✗) |

**Transfers sheet columns (A–D):**
| Column | Field |
|--------|-------|
| A | מספר רכב / Номер машины |
| B | ממי / Кому было |
| C | למי / Кому стало |
| D | תאריך העברה / Дата передачи |

### 3. Google Drive Setup

1. Go to [Google Drive](https://drive.google.com)
2. Create a folder named `cars` (or any name you prefer)
3. Share this folder with the service account email (give **Editor** access)
4. Copy the folder ID from the URL:
   ```
   https://drive.google.com/drive/folders/YOUR_FOLDER_ID_HERE
   ```

### 4. Configure Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIEo...\n-----END RSA PRIVATE KEY-----\n"

GOOGLE_SHEETS_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms
GOOGLE_DRIVE_ROOT_FOLDER_ID=1A2B3C4D5E6F7G8H9I0J
```

**Important for `GOOGLE_PRIVATE_KEY`:** Copy the entire private key from your JSON file. Replace actual newlines with `\n` if needed, or keep the key as-is with the quotes wrapping it.

---

## Local Development

```bash
npm install
npm run dev
```

App runs at [http://localhost:3000](http://localhost:3000)

---

## Deployment to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Add environment variables in Vercel dashboard (Settings → Environment Variables):
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_PRIVATE_KEY`
   - `GOOGLE_SHEETS_ID`
   - `GOOGLE_DRIVE_ROOT_FOLDER_ID`
4. Deploy

**Note for `GOOGLE_PRIVATE_KEY` on Vercel:** Paste the full private key value including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`. Vercel handles the newlines correctly.

---

## How to Edit Car Types

Open `src/config/car-types.ts` and edit the `CAR_TYPES` array:

```ts
export const CAR_TYPES: string[] = [
  'סדאן / Седан',
  'ג\'יפ / Джип / SUV',
  // Add your types here...
  'אחר / Другое',
];
```

Each entry appears as an option in the "Add Car" dropdown. Format: Hebrew / Russian (bilingual).

---

## App Features

- **Add Car** — 3-step form: license plate → details (type, tokef test, mileage, assigned to) → photos (rishaon + car photos)
- **Transfer Car** — Search by plate number, reassign to new person, logs transfer history
- **Google Drive** — Auto-creates a folder per car, uploads rishaon photo + car photos
- **Google Sheets** — All data stored in two sheets: Cars + Transfers history
- **Mobile-first** — Optimized for phones, prevents iOS zoom on input focus
- **Bilingual** — Hebrew (RTL) + Russian labels throughout

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with viewport meta
│   ├── page.tsx            # Home screen (Add Car / Transfer Car)
│   ├── globals.css         # Tailwind + global styles
│   ├── add-car/page.tsx    # Multi-step add car form
│   ├── transfer-car/page.tsx # Transfer car form
│   └── api/
│       ├── cars/route.ts           # GET all cars, POST new car
│       └── cars/[carNumber]/route.ts # GET one car, PUT transfer
├── components/
│   ├── Header.tsx      # App header
│   ├── PhotoUpload.tsx # Camera/file upload with preview
│   └── Toast.tsx       # Notification toasts
├── lib/
│   ├── google-sheets.ts  # All Sheets API operations
│   ├── google-drive.ts   # All Drive API operations
│   └── utils.ts          # Date formatting, plate normalization
└── config/
    └── car-types.ts      # Editable list of car types
```
