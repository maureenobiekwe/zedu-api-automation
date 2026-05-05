/**
 *More API Automation Testing 
 * Testing across /channels, /contact, /testimonials, /token/connection, and /invite endpoints
 *
 * Positive cases  : 3
 * Negative cases  : 5
 * Edge cases      : 2
 * Total           : 10
 */

const { api, getAuthHeader } = require("../utils/auth");
const { createNewUser, IdDoesntExist } = require("../utils/helpers");
const { faker } = require("@faker-js/faker");

describe("Extended API Automation Testing", () => {
  let authHeader;

  beforeAll(async () => {
    authHeader = await getAuthHeader();
  });

  // CHANNELS 

  test("should reject channel creation without auth token", async () => {
    const channelcreation = {
      name: faker.word.noun(),
      description: "Test channel",
      is_private: false,
      topic: "testing"
    };

    const serverResponse = await api.post("/channels").send(channelcreation);
    expect(serverResponse.status).toBe(401);
  });

  test("should reject channel creation with missing required fields", async () => {
    const serverResponse = await api
      .post("/channels")
      .set(authHeader)
      .send({});

    expect(serverResponse.status).toBe(400);
  });

  // CONTACT 

  test("should submit a contact us message with valid data", async () => {
    const contactData = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone_number: "09056789012",
      message: "Hi, can we talk now"
    };

    const serverResponse = await api.post("/contact").send(contactData);
    expect(serverResponse.status).toBe(201);
    expect(serverResponse.body).toHaveProperty("status", "success");
  });

  test("should reject a message in the contact us with missing required fields", async () => {
    const serverResponse = await api.post("/contact").send({});
    expect(serverResponse.status).toBe(422);
  });

  test("should reject a message in the contact us with invalid email format", async () => {
    const contactData = {
      name: "Test User",
      email: "not-an-email",
      phone_number: "09056789012",
      message: "Testing invalid email"
    };

    const serverResponse = await api.post("/contact").send(contactData);
    expect(serverResponse.status).toBe(422);
  });

  // TESTIMONIALS 

  test("should reject testimonial creation without auth token", async () => {
    const testimonialData = {
      company_name: "paystack",
      content: "The service is fantastic, great experience."
    };

    const serverResponse = await api.post("/testimonials").send(testimonialData);
    expect(serverResponse.status).toBe(401);
  });

  test("should reject testimonial creation with empty body", async () => {
    const serverResponse = await api
      .post("/testimonials")
      .set(authHeader)
      .send({});

    expect(serverResponse.status).toBe(422);
  });

  // TOKEN CONNECTION 

  test("should retrieve connection token with valid auth", async () => {
    const serverResponse = await api
      .get("/token/connection")
      .set(authHeader);

    expect(serverResponse.status).toBe(200);
    expect(serverResponse.body.data).toHaveProperty("token");
  });

  test("should reject connection token request without auth", async () => {
    const serverResponse = await api.get("/token/connection");
    expect(serverResponse.status).toBe(401);
  });

  // INVITE

  test("should reject invitation with invalid organisation ID", async () => {
    const inviteData = {
      org_id: IdDoesntExist(),
      emails: [faker.internet.email()],
      role_id: IdDoesntExist()
    };

    const serverResponse = await api
      .post("/invite")
      .set(authHeader)
      .send(inviteData);

    // Should fail because org_id doesn't exist
    expect(serverResponse.status).toBe(404);
  });
});