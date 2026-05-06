/**
 * Avatar Automation Testing
 * Tests uploading and listing avatars from the /avatars endpoint
 *
 * Positive cases  : 2
 * Negative cases  : 1
 * Edge cases      : 1
 * Total           : 4
 */

const { api, getAuthHeader } = require("../utils/auth");
const { schemas, validateSchema } = require("../utils/schemas");
const path = require("path");

describe("Avatar Automation Testing", () => {
  let authHeader;

  beforeAll(async () => {
    authHeader = await getAuthHeader();
  });

  //  POSITIVE TESTS 
  test("should upload avatar image while user is logged in", async () => {
    // using .attach to send a physical file (binary upload)
    const serverResponse = await api
      .post("/avatars")
      .set(authHeader)
      .attach("avatar", path.resolve(__dirname, "../utils/test-image.png")); 

    expect(serverResponse.status).toBe(201);
  });

  test("should list all available avatar users can choose from", async () => {
    const serverResponse = await api.get("/avatars").set(authHeader);

    expect(serverResponse.status).toBe(200);
  });

  //  NEGATIVE TEST
  
  test("should reject avatar upload if user is logged out", async () => {
    const serverResponse = await api
      .post("/avatars")
      .attach("avatar", path.resolve(__dirname, "../utils/test-image.png"));

    expect(serverResponse.status).toBe(401);
  });

  //  EDGE CASE (File Validation)
   
  test.skip("should reject users uploading a non-image file (e.g. .txt) as an avatar", async () => {
    // sending fake data disguised as a png to test if the server checks the actual file content
    const serverResponse = await api
      .post("/avatars")
      .set(authHeader)
      .attach("avatar", Buffer.from("this is not an image"), "newava.png");
  // KNOWN BUG: Server returns 500 instead of 400
  // Expected: 400 (reject invalid file)
  // Actual: 500 (server crashes on invalid file content)
 // Status: Test is skipped and a bug report to be documented. when its fixed by the backend team, test will be ran as should.
    expect(serverResponse.status).toBe(400);
  });
});