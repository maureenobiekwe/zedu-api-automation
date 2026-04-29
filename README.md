# Zedu API Automation

Automated API tests for the [Zedu platform](https://zedu.chat/) built with Jest and Supertest. The whole point is that anyone can clone this, drop in a `.env` file and run the full test suite without needing to ask questions.

## Test Results

![Test Results](test-results.png)

## Demo

## Demo

[Watch the full test run on Loom](https://www.loom.com/share/efc94715e9a84f3bbde15d48037e3938)

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

- **Status codes** — every test checks the HTTP status whether its 200, 201, 400, 401, 404, 422 etc
- **Field presence** — this also checks that the `access_token`, `user`, `message`, `status` fields are all in the server response
- **Data types** — to validate the schema AJV was used. This confirms the fields are strings, objects, arrays depending on the stated type for each field
- **Field values** — It checks if `status` returns `"success"` or `"error"`, it checks the `message` for words like "exist" the "i" in `/exist/i` helps the server to ignore if its upper or lower case, the same is done for `/required|validation/i` only that it checks if either validation or required exists
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

Then register a test account on the staging API. Run this in your terminal (replace the email and password with your own):

```bash
curl -s -X POST "https://api.staging.zedu.chat/api/v1/auth/register" -H "Content-Type: application/json" -d "{\"email\":\"youremail@example.com\",\"password\":\"YourPassword123\",\"first_name\":\"Your\",\"last_name\":\"Name\",\"username\":\"yourusername\"}"
```

If it returns `"User Created Successfully"`, your account is ready. Now open `.env` and fill it in:
```
BASE_URL=https://api.staging.zedu.chat/api/v1
TEST_EMAIL=your_email@example.com
TEST_PASSWORD=YourPassword123
```

Use the same email and password you just registered with. Dont use special characters like `!` in the password just stick to letters and numbers.

### 3. Add a test image

Drop any small `.png` image into the `utils/` folder and name it `test-image.png`. The avatar upload test will use it to run

## Setup Checklist

- [ ] Cloned the repository
- [ ] Ran `npm install`
- [ ] Created `.env` file in the root folder
- [ ] Registered a test account using the curl command above
- [ ] Added TEST_EMAIL and TEST_PASSWORD to `.env`
- [ ] Added BASE_URL to `.env`
- [ ] Dropped a `test-image.png` into the `utils/` folder
- [ ] Ran `npm test` and all 27 tests pass

## Environment variables

| Variable | Required | What it is |
|---|---|---|
| `BASE_URL` | Yes | API base URL, no trailing slash |
| `TEST_EMAIL` | Yes | Email of existing test account |
| `TEST_PASSWORD` | Yes | Password of existing test account |

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
| TS-API-001 | Positive | Registers a new user. Checks 201, schema, and the status says "success" |
| TS-API-004 | Positive | This logs in with the user we just registered. Checks 200 and that access_token is in the server response |
| TS-API-002 | Negative | Tries to register the same email again. Should get 400 with a message about it already existing |
| TS-API-003 | Negative | Sends only an email, no password or name. it should return 422 |
| TS-API-005 | Negative | User tries logging in with the wrong password. Should get 400 and status "error" |
| TS-API-006 | Negative | User attempts logging in with an email that was never registered. Gets 400 status code |
| TS-API-007 | Negative | Sends a completely empty body to register and gets 422 status code |
| TS-API-008 | Negative | User sends an email without @ symbol in the email field and gets 400 |
| TS-API-021 | Boundary | Sends a 300+ character email. Server rejects it with 400 |
| TS-API-EDGE-001 | Edge | Sends a 128+ character password. Server rejects it |
| TS-API-EDGE-002 | Edge | If user registers with special characters in username. it retuns a success, 201 |
| TS-API-022 | Security | Puts SQL injection in the password field while trying to log in. Server returns 400, and doesn't expose anything |
| TS-API-023 | Security | Puts a script tag in the name field. Server accepts it blindly which is a bug |

### user.test.js (10 tests)

| Test ID | Type | What it does |
|---|---|---|
| TS-API-017 | Positive | It updates the profile using form-data, a multipart and not JSON. I tried using JSON and the server rejected it. Now it returns 200 |
| TS-API-009 | Positive | when user logs in, the endpoint receives a valid token. It returns 200 |
| TS-API-012 | Positive | Searches for users successfully if the id is registered |
| TS-API-015 | Positive | Users can update their status with a Unicode emoji. Gets 200 |
| TS-API-010 | Negative | tries logging in and bypassing login, the endpoint recieves no token and the user gets blocked with 401 |
| TS-API-011 | Negative | tries logging in with expired token, lets say a token generated from old passeord, user also gets blocked and recieves a 401 status code |
| TS-API-013 | Negative | used faker to create and ID that doesnt exist, if one searches for it, they get a 400 as status code |
| TS-API-014 | Negative | UUID are numbers, if letters are put, it returns a 400 status code |
| TS-API-016 | Negative | If another user tries to update someone else's status. Should get 403 or 404 |
| TS-API-EDGE-003 | Edge | Hacker sticks a SQL injection string in the URL path. Server handles it safely, returns 400/404 |

### avatar.test.js (4 tests)

| Test ID | Type | What it does |
|---|---|---|
| TS-API-018 | Positive | If a user wants to update their avatar and has a valid token at the moment, it validate and returns 200/201 |
| TS-API-020 | Positive | User, once logged in can see lists of all avatars to choose from, validate 200/201 |
| TS-API-019 | Negative | If however user tries to upload avatar without token, validate 401 |
| TS-API-EDGE-004 | Edge | if a fake image, or a text is used instead of a png or jpg or any other image format, server handles it |

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

- The API lowercases emails when you register but when you try to login it does like an exact match. So if you register with `Test@Email.com`, you have to login with `test@email.com` or it wont work
- TS-API-023 showed that the API accepts `<script>` tags in the name field without doing anything about it. It just registers the user with the script tag as their name
- When I sent a fake image (just text content renamed to .png) the server crashed with a 500. It should have returned 400 but it didnt
- I kept getting 400 on the profile update until I realized `/profile` wants multipart/form-data not JSON. Had to switch from `.send()` to `.field()`
- The status update endpoint needs a real Unicode emoji character. I was sending the word "rocket" and it kept rejecting it
-  Endpoint paths are case sensitive and spelling matters. I used `/avatar` instead of `/avatars` and kept getting 404 until I checked the Swagger docs and saw it has an "s" at the end. Small thing but it will waste your time if you dont catch it

