# Zedu API Automation

Automated API tests for the [Zedu platform](https://zedu.chat/) built with Jest and Supertest. The whole point is that anyone can clone this, drop in a `.env` file and run the full test suite without needing to ask questions.

## Demo

[![Watch the test run](https://cdn.loom.com/sessions/thumbnails/efc94715e9a84f3bbde15d48037e3938-with-play.gif)](https://www.loom.com/share/efc94715e9a84f3bbde15d48037e3938)

## What it tests

| File | What it covers | Tests |
|---|---|---|
| `tests/auth.test.js` | Registration, login, duplicate emails, missing fields, SQL injection, XSS | 13 |
| `tests/user.test.js` | Profile access, token auth, user search, status updates, SQL injection in URL | 10 |
| `tests/avatar.test.js` | Upload avatar, list avatars, upload without auth, invalid file upload | 4 |
| **Total** | | **27** |

No hardcoded tokens anywhere. Every token is fetched from the API at runtime.

## What each test validates

Every test goes beyond just checking the status code. Here's what gets asserted across the suite:

- **Status codes** — every test checks the HTTP status (200, 201, 400, 401, 404, 422 etc)
- **Field presence** — checking that `access_token`, `user`, `message`, `status` fields exist in the response
- **Data types** — schema validation using AJV confirms fields are strings, objects, arrays where expected
- **Field values** — checking `status` is `"success"` or `"error"`, `message` matches expected patterns like `/exist/i` or `/required|validation/i`
- **Error messages** — negative tests verify the API returns meaningful error messages, not just status codes
- **Schema validation** — auth responses, profile responses, and error responses are all validated against defined JSON schemas
- **Security checks** — SQL injection and XSS payloads are tested to make sure the server doesn't expose data or crash

## Prerequisites

- Node.js v18 or higher
- npm v9 or higher

Check with:
```bash
node --version
npm --version
```

## Setup

### 1. Clone and install

```bash
git clone https://github.com/maureenobiekwe/zedu-api-automation
cd zedu-api-automation
npm install
```

### 2. Create your .env file

The `.env` file goes in the **root folder** (same place as package.json).

```bash
cp .env.example .env
```

Open it and fill in your credentials:

```
BASE_URL=https://api.staging.zedu.chat/api/v1
TEST_EMAIL=your_email@example.com
TEST_PASSWORD=YourPassword123
```

The email and password need to be for an account that already exists on the Zedu staging platform.

### 3. Add a test image

Drop any small `.png` image into the `utils/` folder and name it `test-image.png`. The avatar upload test needs it.

## Running the tests

Run everything:
```bash
npm test
```

Run individual test files:
```bash
# auth tests only (register, login, security)
npm run test:auth

# user tests only (profile, search, status)
npm run test:users

# avatar tests only (upload, list, edge cases)
npm run test:avatar
```

Run with detailed output to see each test name:
```bash
npx jest --runInBand --forceExit --verbose
```

## Test Summary

### auth.test.js (13 tests)

| Test ID | Type | What it does |
|---|---|---|
| TS-API-001 | Positive | Register new user, validate 201 + schema + success status |
| TS-API-004 | Positive | Login with registered user, validate 200 + access_token exists |
| TS-API-002 | Negative | Register duplicate email, validate 400 + error message matches /exist/ |
| TS-API-003 | Negative | Register with missing fields, validate 422 + message matches /required/ |
| TS-API-005 | Negative | Login wrong password, validate 400 + status is "error" |
| TS-API-006 | Negative | Login unregistered email, validate 400 |
| TS-API-007 | Negative | Register empty body, validate 422 + message field exists |
| TS-API-008 | Negative | Login invalid email format, validate 400 |
| TS-API-021 | Boundary | Register 300+ char email, validate 400 |
| TS-API-EDGE-001 | Edge | Register with 128+ char password, validate 400 |
| TS-API-EDGE-002 | Edge | Register with special characters in username, validate 201 |
| TS-API-022 | Security | SQL injection in login password, validate 400 + error schema |
| TS-API-023 | Security | XSS script tag in name field, validate server handles it |

### user.test.js (10 tests)

| Test ID | Type | What it does |
|---|---|---|
| TS-API-017 | Positive | Update profile via multipart/form-data, validate 200 |
| TS-API-009 | Positive | Access /users/me with valid token, validate 200 |
| TS-API-012 | Positive | Get user by ID, validate 200 + profile schema |
| TS-API-015 | Positive | Update user status with emoji, validate 200 |
| TS-API-010 | Negative | Access /users/me with no token, validate 401 |
| TS-API-011 | Negative | Access /users/me with fake token, validate 401 |
| TS-API-013 | Negative | Search non-existent user ID, validate 400 |
| TS-API-014 | Negative | Search with letters instead of UUID, validate 400 |
| TS-API-016 | Negative | Update another user's status, validate 403 or 404 |
| TS-API-EDGE-003 | Edge | SQL injection in URL path, validate 400/404 + error schema |

### avatar.test.js (4 tests)

| Test ID | Type | What it does |
|---|---|---|
| TS-API-018 | Positive | Upload avatar with valid token, validate 200/201 |
| TS-API-020 | Positive | List all avatars, validate 200/201 + body defined |
| TS-API-019 | Negative | Upload avatar without token, validate 401 |
| TS-API-EDGE-004 | Edge | Upload fake image content, validate server handles it |

## Project structure

```
zedu-api-automation/
├── tests/
│   ├── auth.test.js         # login, register, security tests
│   ├── user.test.js         # profile, user search, status, auth guards
│   └── avatar.test.js       # upload image, list avatars, edge cases
├── utils/
│   ├── auth.js              # handles all token logic, no hardcoding
│   ├── helpers.js           # faker data generation for idempotency
│   ├── schemas.js           # AJV schema definitions
│   └── test-image.png       # needed for avatar upload tests
├── .env                     # your real credentials (DO NOT commit)
├── .env.example             # template showing what variables are needed
├── .gitignore
├── package.json
└── README.md
```

## How authentication works

`utils/auth.js` reads credentials from `.env` and calls the login endpoint to get a fresh token every time. No tokens are stored or hardcoded in the codebase. The `getAuthHeader()` function returns a ready-to-use header object that test files pass into their requests.

For the user tests, the `beforeAll` block registers a brand new user and grabs the token directly from the registration response — no separate login call needed since the API returns `access_token` on register.

## How test data works

Registration tests use Faker.js to generate a new random email on every run. This means you can run the suite over and over without getting "email already exists" errors. Each test run is independent.

## Things I found while testing

- The API lowercases emails during registration but does exact match on login. If you register with `Test@Email.com`, you need to login with `test@email.com`
- The XSS test (TS-API-023) showed that the API accepts `<script>` tags in the name field without sanitizing them
- Uploading a fake image file (text content with .png extension) crashes the server with a 500 instead of returning a clean 400 error
- The `/profile` endpoint requires `multipart/form-data`, not JSON — sending JSON returns 400
- The `/users/{id}/status` endpoint requires a real Unicode emoji, not just the emoji name as text

## Environment variables

| Variable | Required | What it is |
|---|---|---|
| `BASE_URL` | Yes | API base URL, no trailing slash |
| `TEST_EMAIL` | Yes | Email of existing test account |
| `TEST_PASSWORD` | Yes | Password of existing test account |

## Submission Checklist

- [ ] Repository is **public** on GitHub
- [ ] `.env` is in `.gitignore` and NOT committed
- [ ] `.env.example` shows required variables without real values
- [ ] `npm test` passes all 27 tests from a clean clone
- [ ] No hardcoded tokens, URLs, or credentials anywhere in test files
- [ ] `.env` contents shared with evaluators via Google Doc (not in repo)
- [ ] Blog post published on Medium, LinkedIn, or X
- [ ] GitHub repo link submitted
- [ ] Google Doc link submitted
- [ ] Blog post link submitted