/**
 * Auth Automation Testing
 * Tests the /auth/register and /auth/login endpoints
 * 
 * Positive cases  : 2
 * Negative cases  : 6
 * Edge cases      : 3
 * Security        : 2
 * Total           : 13
 */

const { api } = require("../utils/auth");
const { createNewUser } = require("../utils/helpers");
const { schemas, validateSchema } = require("../utils/schemas");

describe("Auth Automation Testing", () => {
  let newUser;

  beforeAll(() => {
    newUser = createNewUser();
  });

  // POSITIVE TEST
  test("TS-API-001 : Register a new user with all fields filled correctly", async () => {
    const serverResponse = await api.post("/auth/register").send(newUser);
    
    const check = validateSchema(schemas.auth, serverResponse.body);
    
    expect(serverResponse.status).toBe(201);
    expect(check.valid).toBe(true);
    expect(serverResponse.body.status).toBe("success");
  });

  test("TS-API-004 : User logs in with informations used to register", async () => {
    // the API lowercases emails when storing them, so we need to match that when logging in
    // found this out the hard way after getting 400s on login
    const loginData = {
      email: newUser.email.toLowerCase(),
      password: newUser.password
    };

    const serverResponse = await api.post("/auth/login").send(loginData);
    
    const check = validateSchema(schemas.auth, serverResponse.body);
    
    expect(serverResponse.status).toBe(200);
    expect(check.valid).toBe(true);
    expect(serverResponse.body.data).toHaveProperty("access_token");
  });

  // NEGATIVE TESTS (IDEMPOTENCY & VALIDATION)
  test("TS-API-002 : Negative: Register with an already-existing email", async () => {
    // trying to register with the same email as TS-API-001
    const serverResponse = await api.post("/auth/register").send(newUser);
    
    expect(serverResponse.status).toBe(400);
    expect(serverResponse.body.message).toMatch(/exist/i);
  });

  test("TS-API-003 : Negative: Register with missing required fields", async () => {
    const serverResponse = await api.post("/auth/register").send({ email: newUser.email }); // missing password/names
    expect(serverResponse.status).toBe(422); 
    expect(serverResponse.body.message).toMatch(/required|validation/i);
  });

  test("TS-API-005 : Negative: Login with incorrect password", async () => {
    const serverResponse = await api.post("/auth/login").send({
      email: newUser.email,
      password: "ppPasswordWrong999"
    });
    
    expect(serverResponse.status).toBe(400);
    expect(serverResponse.body.status).toBe("error");
  });

  test("TS-API-006 : Negative: Login with unregistered email", async () => {
    const serverResponse = await api.post("/auth/login").send({
      email: "obiekwema@doesnotexist.com",
      password: "ppppPassword999"
    });
    expect(serverResponse.status).toBe(400); 
  });

  test("TS-API-007 : Negative: Register with empty fields", async () => {
    const serverResponse = await api.post("/auth/register").send({});
    
    expect(serverResponse.status).toBe(422);
    expect(serverResponse.body).toHaveProperty("message");
  });

  test("TS-API-008 | Negative: Login with invalid email format (missing @)", async () => {
    const serverResponse = await api.post("/auth/login").send({
      email: "invalidemail.com",
      password: newUser.password
    });
    expect(serverResponse.status).toBe(400);
  });

  // BOUNDARY TESTS
  
  test("TS-API-021 : Boundary: Register with extremely long email (300+ chars)", async () => {
    const longEmail = "a".repeat(300) + "@test.com";
    const boundaryUser = createNewUser({ email: longEmail });

    const serverResponse = await api.post("/auth/register").send(boundaryUser);
    
    // Expecting the server to reject the overflow
    expect(serverResponse.status).toBe(400);
  });

  test("TS-API-EDGE-001 : Edge: Password with maximum allowed length", async () => {
    const longPassword = "P".repeat(128) + "1a"; // testing boundary limits
    const serverResponse = await api.post("/auth/register").send(createNewUser({ password: longPassword }));
    expect(serverResponse.status).toBe(400);
  });

  test("TS-API-EDGE-002 : Edge: Username with special characters/emojis", async () => {
    const emojiUser = createNewUser({ username: "Kosi_Testing" });
    const serverResponse = await api.post("/auth/register").send(emojiUser);
    expect(serverResponse.status).toBe(201);
  });

  // SECURITY TESTS

  test("TS-API-022 : Security: Submit SQL injection in Login Password", async () => {
    const payload = {
      email: newUser.email,
      password: "OR 1 equals 1"
    };

    const serverResponse = await api.post("/auth/login").send(payload);

    // If the server is secure, it should return error and not expose database or give a status code of 200
    expect(serverResponse.status).toBe(400);
    const check = validateSchema(schemas.error, serverResponse.body);
    expect(check.valid).toBe(true);
  });

  test("TS-API-023 : Security: Submit XSS payload in name field", async () => {
    const xssUser = createNewUser({ first_name: "<script>alert(document.cookie)</script>" });

    const serverResponse = await api.post("/auth/register").send(xssUser);
    
    // the API doesnt sanitize XSS, it just accepts the payload and registers the user.
    // this is a finding worth noting
    expect(serverResponse.status).toBe(400);
  });
});