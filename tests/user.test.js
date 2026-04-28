/**
 * User & Profile Automation Testing
 * Covers authorization, user search, profile update, status update
 *
 * Positive cases  : 4
 * Negative cases  : 5
 * Edge cases      : 1
 * Total           : 10
 */

const { api, getAuthHeader, getLoginToken } = require("../utils/auth");
const { IdDoesntExist, createNewUser } = require("../utils/helpers");
const { schemas, validateSchema } = require("../utils/schemas");

describe("User & Profile Automation Testing", () => {
  let authHeader;
  let dynamicUserId; // this replaces the hardcoded ID from swagger

  beforeAll(async () => {
    // creating a fresh user for each test run so we dont get conflicts
    const tempUser = createNewUser();
    
    const registration = await api.post("/auth/register").send(tempUser);
    
    dynamicUserId = registration.body?.data?.user?.id;
    
    // grabbing the token straight from registration response
    // no need to call login separately since register already gives us a token
    const token = registration.body?.data?.access_token;
    
    if (!token) {
      throw new Error(
        "SETUP FAILED: Registration did not return a token. " +
        "Response: " + JSON.stringify(registration.body)
      );
    }
    
    authHeader = { Authorization: `Bearer ${token}` };
  });
  
  //PROFILE UPDATING
  // the /profile endpoint requires multipart/form-data, not JSON
  // i had to use .field() instead of .send() because of this

  test("TS-API-017 : Positive: User can update their information and it is stored", async () => {
    const serverResponse = await api
      .patch("/profile")
      .set(authHeader)
      .field("first_name", "Kosi_Updated");
    
    expect(serverResponse.status).toBe(200);
  });

  // AUTHORIZATION 

  test("TS-API-009 : Positive: User can access endpoint with valid bearer token", async () => {
    const serverResponse = await api.get("/users/me").set(authHeader);
    expect(serverResponse.status).toBe(200);
  });

  test("TS-API-010 : Negative: Attempt to bypass login into a user account", async () => {
    const serverResponse = await api.get("/users/me"); // No token at all
    expect(serverResponse.status).toBe(401);
  });

  test("TS-API-011 : Negative: Stops access from anyone using old/invalid tokens", async () => {
    const serverResponse = await api.get("/users/me").set({ Authorization: "Bearer expired.token.here" });
    expect(serverResponse.status).toBe(401);
  });

  // USER SEARCH
   
  test("TS-API-012 : Positive: Get user profile successfully registered", async () => {
    const serverResponse = await api.get(`/users/${dynamicUserId}`).set(authHeader);
    expect(serverResponse.status).toBe(200);
    expect(validateSchema(schemas.profile, serverResponse.body).valid).toBe(true);
  });

  test("TS-API-013 : Negative: Searching for user profile that does not exist", async () => {
    const fakeId = IdDoesntExist(); // dynamic ID so it works every time
    const serverResponse = await api.get(`/users/${fakeId}`).set(authHeader);
    expect(serverResponse.status).toBe(400);
  });

  test("TS-API-014 : Negative: Searching for user profile with letters instead of UUID", async () => {
    const serverResponse = await api.get("/users/not-a-uuid").set(authHeader);
    expect(serverResponse.status).toBe(400);
  });

  test("TS-API-015 : Positive: User can update status successfully", async () => {
    const statusData = { status_text: "public", emoji: "\u{1F680}" };
    const serverResponse = await api.patch(`/users/${dynamicUserId}/status`).set(authHeader).send(statusData);
    expect(serverResponse.status).toBe(200);
  });

  test("TS-API-016 : Negative: Attempt to update another user's status", async () => {
    const strangerId = IdDoesntExist();
    const serverResponse = await api.patch(`/users/${strangerId}/status`).set(authHeader).send({ status: "private" });
    
    // Should be Forbidden or Not Found, depends on how the API handles it
    expect([403, 404]).toContain(serverResponse.status);
  });

   // EDGE SECURITY TEST
  
  test("TS-API-EDGE-003 : Edge: SQL injection in URL path", async () => {
    const maliciousPathId = "DROP TABLE users"; 
    
    const serverResponse = await api.get(`/users/${maliciousPathId}`).set(authHeader);

    // server should treat this as Bad Request or Not Found, not actually try to run the command
    expect([400, 404]).toContain(serverResponse.status);
    const check = validateSchema(schemas.error, serverResponse.body);
    expect(check.valid).toBe(true);
  });
});