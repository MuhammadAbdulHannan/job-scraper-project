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
  Rule filters ──────► keep only jobs mentioning your keywords
        │              drop companies outside the employee-count range
        │              drop companies whose name/domain/industry looks like an agency
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

Everything after the form submit runs in the background. Apify and AI-Ark call back via webhooks, so the user can close the tab and return later — the run keeps going, and the job ID in the URL brings them back to it.

---

## Stack

**Backend** — Node.js, Express, MongoDB (Mongoose), ExcelJS
**Frontend** — React, Vite
**External services** — Apify, OpenAI, Perplexity, AI-Ark
**Hosting** — Render (backend web service + frontend static site), MongoDB Atlas

---

## Getting started

### Prerequisites

- Node.js 18 or newer
- A MongoDB database (Atlas free tier works)
- API keys for the four services below
- [ngrok](https://ngrok.com) for local development — webhooks need a public URL

### API keys

| Service    | Used for                                   | Where to get it                         |
| ---------- | ------------------------------------------ | --------------------------------------- |
| Apify      | Running the job scrapers                   | Console → Settings → API & Integrations |
| OpenAI     | Classifying companies with descriptions    | platform.openai.com → API keys          |
| Perplexity | Classifying companies without descriptions | Settings → API                          |
| AI-Ark     | Contact data, emails, phone numbers        | Account dashboard                       |

All four are paid. Verify a key works before running the whole pipeline — a bad key otherwise surfaces three steps into a run:

```bash
# AI-Ark — returns your remaining credit balance
curl https://api.ai-ark.com/api/developer-portal/v1/payments/credits -H "X-TOKEN: your_key"

# OpenAI — returns the model list
curl https://api.openai.com/v1/models -H "Authorization: Bearer your_key"
```

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

# Where Apify and AI-Ark send their webhooks. This is the BACKEND url.
# Local: your ngrok URL. Production: your Render backend URL. No trailing slash.
PUBLIC_BASE_URL=https://your-subdomain.ngrok-free.app

# Protects the manual job-resume endpoint
ADMIN_SECRET=some-long-random-string
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

Copy the `https://` URL into `PUBLIC_BASE_URL` and restart the backend.

> **Two things bite here.** ngrok issues a new URL on every restart of the free plan — if runs get stuck at "Scraping", a stale `PUBLIC_BASE_URL` is the first thing to check. And `PUBLIC_BASE_URL` must point at the **backend**, not the frontend. The webhook routes live on the Express server; pointing it at the React site means callbacks go nowhere and the run hangs silently.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173`. To point it elsewhere, create `frontend/.env`:

```env
VITE_API_URL=https://your-backend-url.com/api
```

> Vite bakes environment variables in **at build time**. Changing `VITE_API_URL` on a deployed site does nothing until you redeploy.

---

## Project layout

```
backend/
├── index.js                       Express app, middleware, route mounting
├── config/
│   └── db.js                      MongoDB connection
├── constants/
│   ├── apifyConstants.js          Actor IDs, job statuses, date-window mapping
│   ├── filterConstants.js         Staffing words, match modes, keyword matching
│   ├── aiConstants.js             Model names, classifier prompt, batch sizes
│   ├── aiArkConstants.js          Endpoints, contacts-per-company cap
│   └── exportConstants.js         Spreadsheet columns and formats
├── middleware/
│   └── adminAuth.js               Secret-header check for admin routes
├── models/
│   └── job.model.js               The single Job document — inputs, results, status
├── routes/
│   ├── scrape.routes.js           POST /scrape, GET /job-status, GET /download
│   ├── webhook.routes.js          Apify and AI-Ark webhook receivers
│   └── admin.routes.js            POST /resume/:jobId
├── controllers/
│   ├── scrape.controller.js       Starts runs, reports status
│   ├── webhook.controller.js      Apify callback + the whole pipeline
│   ├── aiarkWebhook.controller.js AI-Ark callback, collects contacts
│   ├── export.controller.js       Builds and streams the file
│   └── admin.controller.js        Manual resume for stalled jobs
├── services/
│   ├── apify.service.js           Triggers actors, fetches results
│   ├── filter.service.js          Rule-based filtering
│   ├── ai.service.js              GPT and Perplexity calls
│   ├── classification.service.js  Batched agency classification
│   ├── aiark.service.js           AI-Ark API wrapper
│   ├── contactLookup.service.js   Company resolution, people search, phones
│   └── export.service.js          XLSX and CSV generation
└── helpers/
    ├── jobHelpers.js              Platform normalizing, employee parsing, keyword matching
    ├── contactHelpers.js          Person mapping, per-company cap
    └── exportHelpers.js           Domain matching, row building

frontend/src/
├── App.jsx                        View switching, polling, form prefill
├── components/
│   ├── SearchForm.jsx             The search form
│   ├── RunProgress.jsx            Parameters, pipeline stages, download
│   └── TagInput.jsx               Multi-value input for keywords and titles
├── constants/
│   ├── searchConstants.js         Form defaults, options, hints
│   └── statusConstants.js         API URL, poll interval, pipeline stages
└── helpers/
    ├── apiHelpers.js              Fetch wrappers
    └── formatHelpers.js           Stage state, validation, elapsed time
```

**Convention:** components hold state and handlers only. Reusable values live in `constants/`, pure functions in `helpers/`.

---

## Search options

| Option                 | What it does                                                                                                      |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Job titles**         | Scrape terms. Each one runs as a separate search on every platform selected.                                      |
| **Location**           | City, region, or country. Free-form.                                                                              |
| **Job boards**         | LinkedIn, Indeed, or both.                                                                                        |
| **Posted within**      | Any time, 24 hours, past week, past month. Recent postings are a stronger hiring signal and cost less to process. |
| **Listings per title** | How many results to pull per keyword per platform.                                                                |
| **Company size**       | Employee-count range. See the note on bands below.                                                                |
| **Must mention**       | Optional. Only keeps jobs containing at least one of these terms, in the title, the description, or both.         |
| **Who to find**        | Persona titles. Up to two people per company, most senior first.                                                  |
| **Contact details**    | Emails and/or mobile numbers. Phones cost roughly ten times what emails do.                                       |

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
| Date-window values sent to each actor        | `backend/constants/apifyConstants.js` → `POSTED_WITHIN_MAP`            |
| API rate limiting / batch sizes              | `backend/constants/aiConstants.js`, `aiArkConstants.js`                |
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
  "postedWithin": "week",
  "jobsPerKeyword": 25,
  "employeeCountMin": 50,
  "employeeCountMax": 500,
  "filterKeywords": ["react", "node"],
  "filterMatchIn": ["title"],
  "personaTitles": ["vp of sales", "hiring manager"],
  "needEmail": true,
  "needPhone": false
}
```

`postedWithin` accepts `any`, `day`, `week`, `month`.
`filterMatchIn` accepts `title`, `description`, or both.

### `GET /api/job-status/:jobId`

Current status, live counts, and the original inputs. The frontend polls this every 3 seconds.

| Status             | Meaning                                      |
| ------------------ | -------------------------------------------- |
| `scraping`         | Apify actors running                         |
| `filtering`        | Applying keyword, size and agency-word rules |
| `classifying`      | AI reviewing companies for staffing agencies |
| `finding_contacts` | AI-Ark looking up people                     |
| `ready`            | Contacts found, file available               |
| `empty`            | Ran fine, but nothing matched                |
| `failed`           | Something broke — see `error`                |

### `GET /api/download/:jobId?format=xlsx`

Streams the file. `format` is `xlsx` or `csv`. Returns `409` if the job isn't ready.

Files are **not stored anywhere** — each download is generated fresh from MongoDB. Nothing to clean up, and it survives server restarts.

### `POST /api/admin/resume/:jobId`

Manually pushes a stalled job forward. Requires an `x-admin-secret` header.

```bash
curl -X POST https://your-backend.onrender.com/api/admin/resume/JOB_ID -H "x-admin-secret: your-secret"
```

Use this when Apify runs succeeded but the webhooks never arrived — a config slip, a deploy mid-run, a brief outage. Results already sit in Apify's storage and refetching them is free, so this recovers a job without paying to scrape again.

### `POST /api/apify-webhook` · `POST /api/aiark-webhook`

Called by the external services, not by you.

---

## Costs

Every run spends real money across four services.

| Service    | Charged for                                | Cost                                           |
| ---------- | ------------------------------------------ | ---------------------------------------------- |
| Apify      | Scraping                                   | ~$0.50 per 1,000 listings, plus platform usage |
| OpenAI     | Classifying companies with descriptions    | Fractions of a cent each                       |
| Perplexity | Classifying companies without descriptions | More than GPT; rarely used                     |
| AI-Ark     | Person data                                | 0.5 credits each                               |
| AI-Ark     | Verified email                             | +0.5 credits each                              |
| AI-Ark     | Mobile number                              | **5 credits each**                             |

**A real run, for reference:** 2 keywords × 2 platforms × 100 listings = 500 jobs scraped, 112 companies surviving filters, 144 contacts with 123 emails and 115 phone numbers. Roughly 10 minutes end to end. Apify's share was about $0.26.

Phone numbers dominate the cost. Leave that toggle off unless the numbers are genuinely needed.

Check the AI-Ark balance any time:

```bash
curl https://api.ai-ark.com/api/developer-portal/v1/payments/credits -H "X-TOKEN: your_key"
```

---

## Things worth knowing

**Company sizes are bands, not numbers.** LinkedIn reports `51-200 employees`; Indeed reports `501 to 1,000`, and sometimes `Decline to state`. A company is included when its band _overlaps_ the requested range — so asking for 50–500 will include an `11-50` company, since one of those employees might be the 50th. Switch `DEFAULT_EMPLOYEE_MATCH_MODE` to `CONTAINED` for strict matching, and expect far fewer results.

**Companies with no size data are excluded.** Indeed lets employers hide it, and some LinkedIn pages (universities, for example) don't expose it. Those never reach the contact lookup.

**Multiple keywords means multiple runs.** Three keywords on two platforms is six actor runs. Cost scales linearly.

**Only one webhook runs the pipeline.** When several actors finish at once, an atomic status claim in MongoDB ensures exactly one proceeds. Without it you'd get duplicate AI-Ark exports and double charges.

**Contacts are capped per company and sorted by seniority.** If five people match, you get the two most senior.

**Failed AI classification keeps the company.** A dropped lead is worse than an agency slipping through — a human can spot the agency in the spreadsheet, but can't recover a company that was never listed.

**The two platforms return different field names.** Indeed uses `company`, `companyEmployeeRange`, `url`, `jobLocationShort`; LinkedIn uses `companyName`, `companyEmployeesCount`, `link`, `location`. `normalizeJob()` in `jobHelpers.js` maps both into one shape before anything downstream sees them. Add a new platform there.

**Indeed can't fill every column.** Founded year, job function and applicant count don't exist in its data. Employment type is buried in an attributes array and isn't extracted. Those cells stay empty for Indeed rows.

**Some emails come back INVALID.** AI-Ark found an address but couldn't verify it. They're included with their status in the Email Status column — filter on it if you only want verified ones.

**The Apify actors are third-party.** If either is removed from the store or changes its input schema, runs fail with an `invalid-input` error naming the offending field. The current schema for each is on its actor page in the Apify console.

---

## Deployment

### Backend → Render web service

1. New Web Service, root directory `backend`
2. Build: `npm install` · Start: `npm start`
3. Add every variable from `.env` in the Render dashboard — but **not** `PORT`, which Render sets itself
4. Once deployed, set `PUBLIC_BASE_URL` to the Render URL and let it redeploy

Render appends a random suffix to service names — the URL is something like `job-scraper-backend-b2zy.onrender.com`, not `job-scraper-backend.onrender.com`. Copy it exactly.

> Don't use the free tier. It sleeps after 15 minutes idle, and **a sleeping service misses webhooks**, leaving runs stuck at "Scraping" with no error.

### Frontend → Render static site

1. New Static Site, root directory `frontend`
2. Build: `npm install && npm run build` · Publish directory: `dist`
3. Set `VITE_API_URL` to the backend URL plus `/api`
4. Under Redirects/Rewrites, add: source `/*`, destination `/index.html`, action **Rewrite**

### MongoDB Atlas

Under Network Access, allow `0.0.0.0/0` — Render's outbound IPs aren't fixed.

### Custom domain

Static site → Settings → Custom Domains. Render issues the SSL certificate automatically once the DNS records it gives you are live at your registrar.

---

## Troubleshooting

**Stuck on "Scraping job listings"**
The webhooks aren't arriving. Check `PUBLIC_BASE_URL` first — it must be the **backend** URL, exact, no trailing slash. Then confirm the runs actually finished:

```bash
curl "https://api.apify.com/v2/actor-runs?token=YOUR_TOKEN&limit=10&desc=1"
```

If they show `SUCCEEDED`, use the resume endpoint rather than re-scraping.

**`Webhook requestUrl must be a valid URL`**
`PUBLIC_BASE_URL` is empty or missing on the server.

**`401` from an API**
The key is invalid or missing. Test it in isolation with the curl commands above before assuming the code is wrong. Keys shared in documents often get auto-revoked by the provider.

**`429` from Perplexity**
Rate limited. Increase `AI_BATCH_DELAY_MS` or reduce `AI_BATCH_SIZE` in `aiConstants.js`.

**`Input is not valid: Field input.X ...`**
An actor's schema doesn't match what we're sending. The error names the field and often the accepted values. Check the actor's Input tab in the Apify console for the current schema.

**Everything filtered out, zero kept**
Usually the employee-count range or the keyword filter. Check `removedJobs` in the job document — every removal records a reason and the value that caused it.

**Contacts found but no emails**
Confirm `needEmail` was true, then check `aiArkExport.state` on the job. If it's still `PENDING`, the AI-Ark webhook never arrived.

**`404` on a phone lookup**
Normal. AI-Ark has no number for that person. The contact is kept, the phone stays empty, and you aren't charged.

**`Cannot overwrite model once compiled`**
Two files differing only in case (`job.model.js` and `Job.model.js`). Windows hides this; Linux doesn't. Keep filenames lowercase throughout.

**Version conflict errors in the webhook**
Concurrent writes to the same job. The webhook uses atomic `updateOne` operations to avoid this — if you add writes there, use the same pattern rather than `save()`.

---

## Debugging a run

Every job document keeps the full trail:

| Field                   | Contains                                                   |
| ----------------------- | ---------------------------------------------------------- |
| `inputs`                | Exactly what was searched                                  |
| `apifyRuns`             | Every actor run with its ID, platform and status           |
| `scrapedJobs`           | Raw listings, normalized to one shape                      |
| `filteredJobs`          | What survived the rule filters                             |
| `removedJobs`           | What didn't, and **why** — reason plus the offending value |
| `cleanedCompanies`      | Survivors with their AI classification and reasoning       |
| `aiArkExport`           | Track ID and state of the contact export                   |
| `contacts`              | Final people with emails and phones                        |
| `error` / `emptyReason` | What went wrong, in plain language                         |

`removedJobs` is the one to check first when results look wrong. It answers "why did company X disappear" directly.

Live output is in Render → the service → **Logs**. The **Events** tab shows deploys and restarts rather than application output.
