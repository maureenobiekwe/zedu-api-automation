/**
 * we want to get the valid information stored in .env inorder to generate a token
 */

// This reads the information stored in the env and saves it in process.env
require("dotenv").config();

// This helps to automate all my tests without the need of Chrome or Postman
const supertest = require("supertest");

// this helps to get the base url wiithout having to constantly paste the link, I added a fallback just in case the base url doesnt exist in the env file
const BASE_URL = process.env.BASE_URL || 'https://api.staging.zedu.chat/api/v1';
const api = supertest(BASE_URL);


async function getLoginToken(email, password) {
  
  // checking if we have all the correct informations
  if (!BASE_URL) {
    throw new Error("CRITICAL ERROR: BASE_URL is not defined. Did you create a .env file?");
  }
  if (!email || !password) {
    throw new Error("LOGIC ERROR: You tried to log in without providing an email or password.");
  }

  // Sending a POST request
  const response = await api.post("/auth/login").send({ 
    email: email, 
    password: password 
  });

  // logging the server message if login fails so we can debug easier
  if (response.status !== 200 && response.status !== 201) {
    console.log("SERVER ERROR MESSAGE:", JSON.stringify(response.body, null, 2));
    throw new Error(
      `AUTHENTICATION FAILED: Server responded with status ${response.status}. ` +
      `Check if your test credentials in .env are correct.`
    );
  }

  // depending on how the token is returned, these all mean the same thing
  // different developers structure their responses differently
  const token =
    response.body?.data?.token ||
    response.body?.token ||
    response.body?.access_token ||
    response.body?.data?.access_token;

  // If Login was successful but no token, it is documented and displayed on the console at runtime
  if (!token) {
    throw new Error("STRUCTURE ERROR: Login was successful, but the token was not found in the response body.");
  }

  return token;
}

// Logs in the user that have the same information as written in the .env
async function getAdminToken() {
  const email = process.env.TEST_EMAIL;
  const password = process.env.TEST_PASSWORD;

  //Checking if the .env file isnt empty
  if (!email || !password) {
    throw new Error("MISSING CONFIG: TEST_EMAIL or TEST_PASSWORD is not set in your .env file.");
  }
  return getLoginToken(email, password);
}

//Saves the token in the { "Authorization": "Bearer <TOKEN>" } header to avoid typing manually in every test file
 
async function getAuthHeader() {
  const token = await getAdminToken();
  return { Authorization: `Bearer ${token}` };
}

// Making it accessible for the test files
module.exports = { 
    getLoginToken, 
    getAdminToken, 
    getAuthHeader, 
    api 
};