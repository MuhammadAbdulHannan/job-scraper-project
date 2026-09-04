# Job Scraper & Contact Finder

Scrapes job listings from LinkedIn and Indeed, filters out staffing agencies, finds decision-makers at the remaining companies, and exports the result as a spreadsheet.

The idea: a company posting jobs is a company that's growing. This tool turns that hiring signal into a list of people you can actually contact.

---

## How it works

```
User submits search
        │
        ▼
  Apify actors ──────► scrape job listings (one run per keyword × platform)
        │
        ▼
  Rule filters ──────► drop companies outside the employee-count range
        │              drop companies whose name/domain/industry contains staffing words
        ▼
  AI classifier ─────► GPT-4o-mini reads the company description
        │              Perplexity checks the website when no description exists
        │              anything judged a staffing agency is removed
        ▼
  AI-Ark ────────────► resolve companies, find up to 2 contacts each
        │              verified emails, optional mobile numbers
        ▼
  Ready to download ─► XLSX or CSV, generated on demand
```

Everything after the form submit runs in the background. Apify and AI-Ark call back via webhooks, so the user can close the tab and return later — the run keeps going.

---

## Stack

**Backend** — Node.js, Express, MongoDB (Mongoose), ExcelJS
**Frontend** — React, Vite
**External services** — Apify, OpenAI, Perplexity, AI-Ark

---

## Getting started

### Prerequisites

- Node.js 18 or newer
- A MongoDB database (Atlas free tier is fine)
- API keys for Apify, OpenAI, Perplexity and AI-Ark
- [ngrok](https://ngrok.com) for local development — webhooks need a public URL

### Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/job-scraper-project

APIFY_TOKEN=apify_api_...
OPENAI_API_KEY=sk-...
PERPLEXITY_API_KEY=pplx-...
AI_ARK_API_KEY=...

# Where Apify and AI-Ark send their webhooks.
# Local: your ngrok URL. Production: your deployed backend URL.
PUBLIC_BASE_URL=https://your-subdomain.ngrok-free.app
```

Start it:

```bash
npm run dev
```

Confirm it's alive at `http://localhost:5000/api/health`.

### Webhook tunnel

In a second terminal:

```bash
ngrok http 5000
```

Copy the `https://` URL it prints into `PUBLIC_BASE_URL` and restart the backend.

> **Watch out:** ngrok issues a new URL every restart on the free plan. If a run gets stuck at "Scraping job listings" forever, a stale `PUBLIC_BASE_URL` is the first thing to check — the webhook is being delivered to a tunnel that no longer exists.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173`. To point it somewhere other than `localhost:5000`, create `frontend/.env`:

```env
VITE_API_URL=https://your-backend-url.com/api
```

---

## Project layout

```
backend/
├── index.js                       Express app, middleware, route mounting
├── config/
│   └── db.js                      MongoDB connection
├── constants/
│   ├── apifyConstants.js          Actor IDs, job statuses, run statuses
│   ├── filterConstants.js         Staffing words, match modes, stripped fields
│   ├── aiConstants.js             Model names, classifier prompt, batch sizes
│   ├── aiArkConstants.js          Endpoints, contacts-per-company cap
│   └── exportConstants.js         Spreadsheet columns and formats
├── models/
│   └── job.model.js               The single Job document — inputs, results, status
├── routes/
│   ├── scrape.routes.js           POST /scrape, GET /job-status, GET /download
│   └── webhook.routes.js          Apify and AI-Ark webhook receivers
├── controllers/
│   ├── scrape.controller.js       Starts runs, reports status
│   ├── webhook.controller.js      Apify callback + the whole pipeline
│   ├── aiarkWebhook.controller.js AI-Ark callback, collects contacts
│   └── export.controller.js       Builds and streams the file
├── services/
│   ├── apify.service.js           Triggers actors, fetches results
│   ├── filter.service.js          Rule-based filtering
│   ├── ai.service.js              GPT and Perplexity calls
│   ├── classification.service.js  Batched agency classification
│   ├── aiark.service.js           AI-Ark API wrapper
│   ├── contactLookup.service.js   Company resolution, people search, phones
│   └── export.service.js          XLSX and CSV generation
└── helpers/
    ├── jobHelpers.js              Employee-count parsing, normalizing, grouping
    ├── contactHelpers.js          Person mapping, per-company cap
    └── exportHelpers.js           Domain matching, row building

frontend/src/
├── App.jsx                        View switching, polling
├── components/
│   ├── SearchForm.jsx             The search form
│   ├── RunProgress.jsx            Pipeline stages, download buttons
│   └── TagInput.jsx               Multi-value input for keywords and titles
├── constants/
│   ├── searchConstants.js         Form defaults, platform list, hints
│   └── statusConstants.js         API URL, poll interval, pipeline stages
└── helpers/
    ├── apiHelpers.js              Fetch wrappers
    └── formatHelpers.js           Stage state, validation, formatting
```

**Convention:** components hold state and handlers only. Reusable values live in `constants/`, pure functions in `helpers/`.

---

## Where to change things

| To change...                                 | Edit                                                                   |
| -------------------------------------------- | ---------------------------------------------------------------------- |
| The staffing-agency word list                | `backend/constants/filterConstants.js` → `DEFAULT_STAFFING_WORDS`      |
| How the AI decides what a staffing agency is | `backend/constants/aiConstants.js` → `CLASSIFIER_SYSTEM_PROMPT`        |
| Contacts returned per company                | `backend/constants/aiArkConstants.js` → `MAX_CONTACTS_PER_COMPANY`     |
| Which Apify actors are used                  | `backend/constants/apifyConstants.js` → `ACTOR_IDS`                    |
| Columns in the exported file                 | `backend/constants/exportConstants.js` → `EXPORT_COLUMNS`              |
| Strict vs loose employee-count matching      | `backend/constants/filterConstants.js` → `DEFAULT_EMPLOYEE_MATCH_MODE` |
| Which seniority ranks first                  | `backend/helpers/contactHelpers.js` → `SENIORITY_RANK`                 |
| Suggested persona titles in the form         | `frontend/src/constants/searchConstants.js`                            |
| How often the frontend polls                 | `frontend/src/constants/statusConstants.js` → `POLL_INTERVAL_MS`       |

---

## API

### `POST /api/scrape`

Starts a run. Returns immediately with a `jobId`.

```json
{
  "keywords": ["software engineer", "data engineer"],
  "location": "California",
  "platforms": ["linkedin", "indeed"],
  "jobsPerKeyword": 25,
  "employeeCountMin": 50,
  "employeeCountMax": 500,
  "personaTitles": ["vp of sales", "hiring manager"],
  "needEmail": true,
  "needPhone": false
}
```

### `GET /api/job-status/:jobId`

Current status plus live counts. The frontend polls this every 3 seconds.

| Status             | Meaning                                      |
| ------------------ | -------------------------------------------- |
| `scraping`         | Apify actors running                         |
| `filtering`        | Applying employee-count and keyword rules    |
| `classifying`      | AI reviewing companies for staffing agencies |
| `finding_contacts` | AI-Ark looking up people                     |
| `ready`            | Contacts found, file available               |
| `empty`            | Ran fine, but nothing matched the filters    |
| `failed`           | Something broke — see `error`                |

### `GET /api/download/:jobId?format=xlsx`

Streams the file. `format` is `xlsx` or `csv`. Returns `409` if the job isn't ready.

Files are **not stored anywhere** — each download is generated fresh from MongoDB. Nothing to clean up, and it survives server restarts.

### `POST /api/apify-webhook` · `POST /api/aiark-webhook`

Called by the external services, not by you.

---

## Costs

Every run spends real money across four services. Rough per-run figures:

| Service    | Charged for                                | Cost                                       |
| ---------- | ------------------------------------------ | ------------------------------------------ |
| Apify      | Scraping                                   | Per actor run — see the actor's Apify page |
| OpenAI     | Classifying companies with descriptions    | Fractions of a cent per company            |
| Perplexity | Classifying companies without descriptions | Slightly more; rarely used                 |
| AI-Ark     | Person data                                | 0.5 credits each                           |
| AI-Ark     | Verified email                             | +0.5 credits each                          |
| AI-Ark     | Mobile number                              | **5 credits each**                         |

Phone numbers cost roughly ten times what emails do. Leave that toggle off unless the numbers are genuinely needed.

Check your AI-Ark balance any time:

```bash
curl https://api.ai-ark.com/api/developer-portal/v1/payments/credits \
  -H "X-TOKEN: your_key"
```

---

## Things worth knowing

**Company sizes are bands, not numbers.** LinkedIn reports `51-200 employees`; Indeed reports `501 to 1,000` or sometimes `Decline to state`. A company is included when its band _overlaps_ the requested range, so asking for 50–500 will include an `11-50` company. Switch `DEFAULT_EMPLOYEE_MATCH_MODE` to `CONTAINED` for strict matching — expect far fewer results.

**Companies with no size data are excluded.** Indeed lets employers hide it, and some LinkedIn pages (universities, for example) don't expose it. Those companies never reach the contact lookup.

**Multiple keywords means multiple runs.** Three keywords on two platforms is six actor runs. Cost scales linearly.

**Only one webhook runs the pipeline.** When several actors finish at once, an atomic status claim ensures exactly one webhook proceeds. Without it you'd get duplicate AI-Ark exports and double charges.

**Contacts are capped per company and sorted by seniority.** If five people match, you get the two most senior.

**Failed AI classification keeps the company.** A dropped lead is worse than an agency slipping through — a human can spot the agency in the spreadsheet, but can't recover a company that was never listed.

**The two platforms return different field names.** Indeed's raw output uses `company`, `companyEmployeeRange`, `url`; LinkedIn uses `companyName`, `companyEmployeesCount`, `link`. `normalizeJob()` in `jobHelpers.js` maps both to one shape before anything downstream sees them. Add a new platform there.

---

## Deployment

### Backend → Render

1. New Web Service, pointed at this repo, root directory `backend`
2. Build: `npm install` · Start: `npm start`
3. Add every variable from `.env` in the Render dashboard
4. Once deployed, set `PUBLIC_BASE_URL` to the Render URL (`https://your-app.onrender.com`) and redeploy

> On Render's free tier the service sleeps after 15 minutes idle and takes 30–60 seconds to wake. Worse, **a sleeping service can miss webhooks**, leaving runs stuck. The paid starter tier removes this and is worth it before real use.

### Frontend → Vercel

1. Import the repo, root directory `frontend`
2. Framework preset: Vite
3. Set `VITE_API_URL` to `https://your-backend.onrender.com/api`

### MongoDB Atlas

Under Network Access, allow `0.0.0.0/0` so Render can connect.

---

## Troubleshooting

**Stuck on "Scraping job listings"**
`PUBLIC_BASE_URL` doesn't match your current tunnel or deployment. Check the Apify run in their console — if it succeeded but your server logged nothing, the webhook went to the wrong address.

**`401` from an API**
The key is invalid or missing. Test it in isolation before assuming the code is wrong — keys shared in documents often get auto-revoked by the provider.

**`429` from Perplexity**
Rate limited. Increase `AI_BATCH_DELAY_MS` or reduce `AI_BATCH_SIZE` in `aiConstants.js`.

**Everything filtered out, zero kept**
Almost always the employee-count range. Widen it, or check `removedJobs` in the job document — every removal records a reason and the value that caused it.

**Contacts found but no emails**
Confirm `needEmail` was true. Then check `aiArkExport.state` on the job — if it's still `PENDING`, the AI-Ark webhook never arrived.

**`404` on a phone lookup**
Normal. AI-Ark has no number for that person. The contact is kept, the phone field stays empty, and you aren't charged.

**Version conflict errors in the webhook**
Concurrent writes to the same job. The webhook uses atomic `updateOne` operations to avoid this — if you add new writes there, use the same pattern rather than `save()`.

---

## Debugging a run

Every job document keeps the full trail:

| Field                   | Contains                                                   |
| ----------------------- | ---------------------------------------------------------- |
| `inputs`                | Exactly what was searched                                  |
| `apifyRuns`             | Every actor run with its ID and status                     |
| `scrapedJobs`           | Raw listings, normalized                                   |
| `filteredJobs`          | What survived the rule filters                             |
| `removedJobs`           | What didn't, and **why** — reason plus the offending value |
| `cleanedCompanies`      | Survivors with their AI classification and reasoning       |
| `contacts`              | Final people with emails and phones                        |
| `error` / `emptyReason` | What went wrong, in plain language                         |

`removedJobs` is the one to check first when results look wrong. It answers "why did company X disappear" directly.
