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

  test("should update user profile with valid information or data type", async () => {
    const serverResponse = await api
      .patch("/profile")
      .set(authHeader)
      .field("first_name", "Kosi_Updated");
    
    expect(serverResponse.status).toBe(200);
  });

  // AUTHORIZATION 

  test("should access endpoint with valid bearer token of the user", async () => {
    const serverResponse = await api.get("/users/me").set(authHeader);
    expect(serverResponse.status).toBe(200);
  });

  test("should return 401 if attempt to bypass login into a user account is sensed", async () => {
    const serverResponse = await api.get("/users/me"); // No token at all
    expect(serverResponse.status).toBe(401);
  });

  test("should return 401 when anyone uses old/invalid tokens", async () => {
    const serverResponse = await api.get("/users/me").set({ Authorization: "Bearer expired.token.here" });
    expect(serverResponse.status).toBe(401);
  });

  // USER SEARCH
   
  test("should return profiles of users that are successfully registered", async () => {
    const serverResponse = await api.get(`/users/${dynamicUserId}`).set(authHeader);
    expect(serverResponse.status).toBe(200);
    expect(validateSchema(schemas.profile, serverResponse.body).valid).toBe(true);
  });

  test("should return 400 if user profile that does not exist is searched", async () => {
    const fakeId = IdDoesntExist(); // dynamic ID so it works every time
    const serverResponse = await api.get(`/users/${fakeId}`).set(authHeader);
    expect(serverResponse.status).toBe(400);
  });

  test("should return 400 if user profile is searched with letters instead of UUID", async () => {
    const serverResponse = await api.get("/users/not-a-uuid").set(authHeader);
    expect(serverResponse.status).toBe(400);
  });

  test("should allow users update status successfully", async () => {
    const statusData = { status_text: "public", emoji: "\u{1F680}" };
    const serverResponse = await api.patch(`/users/${dynamicUserId}/status`).set(authHeader).send(statusData);
    expect(serverResponse.status).toBe(200);
  });

  test("should reject attempt to update another user's status", async () => {
    const strangerId = IdDoesntExist();
    const serverResponse = await api.patch(`/users/${strangerId}/status`).set(authHeader).send({ status: "private" });
    
    
    expect(serverResponse.status).toBe(403);
  });

   // EDGE SECURITY TEST
  
  test("should handle SQL injection in URL path safely", async () => {
    const maliciousPathId = "DROP TABLE users"; 
    
    const serverResponse = await api.get(`/users/${maliciousPathId}`).set(authHeader);

    
    expect(serverResponse.status).toBe(400);
    const check = validateSchema(schemas.error, serverResponse.body);
    expect(check.valid).toBe(true);
  });
});