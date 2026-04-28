# Zedu API Automation

Automated API tests for the [Zedu platform](https://zedu.chat/) built with Jest and Supertest. The whole point is that anyone can clone this, drop in a `.env` file and run the full test suite without needing to ask questions.

## What it tests

| File | What it covers | Tests |
|---|---|---|
| `tests/auth.test.js` | Registration, login, duplicate emails, missing fields, SQL injection, XSS | 13 |
| `tests/user.test.js` | Profile access, token auth, user search, status updates, SQL injection in URL | 10 |
| `tests/avatar.test.js` | Upload avatar, list avatars, upload without auth, invalid file upload | 4 |
| **Total** | | **27** |

No hardcoded tokens anywhere. Every token is fetched from the API at runtime.

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

Run just one file:
```bash
npm run test:auth
npm run test:users
npm run test:avatar
```

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

## How test data works

Registration tests use Faker.js to generate a new random email on every run. This means you can run the suite over and over without getting "email already exists" errors. Each test run is independent.

## Things I found while testing

- The API lowercases emails during registration but does exact match on login. If you register with `Test@Email.com`, you need to login with `test@email.com`
- The XSS test (TS-API-023) showed that the API accepts `<script>` tags in the name field without sanitizing them
- Uploading a fake image file (text content with .png extension) crashes the server with a 500 instead of returning a clean 400 error

## Environment variables

| Variable | Required | What it is |
|---|---|---|
| `BASE_URL` | Yes | API base URL, no trailing slash |
| `TEST_EMAIL` | Yes | Email of existing test account |
| `TEST_PASSWORD` | Yes | Password of existing test account |