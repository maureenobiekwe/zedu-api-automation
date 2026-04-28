/**
 * utils/helpers.js
 * is used to make sure that the same API request always yields the same result everytime
 */
const { faker } = require("@faker-js/faker");

//  Using faker.js so that a new email is always used to test the script and there is no conflict error (409)
 
function createNewUser(overrides = {}) {
  return {
    username: faker.internet.userName(),
    email: faker.internet.email(),
    password: "TestPass1234",
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    phone_number: faker.phone.number(),
    ...overrides,
  };
}

/**
 * This creates a random ID using faker.js that isnt in the zedu database
 * used for negative testing and it returns the correct error even if the test 
 * is carried out twice consecutively
 */
function IdDoesntExist() {
  return faker.string.uuid();
}

/**
 * If an error is thrown, we want to clearly know what went wrong
 */
function expectErrorBody(body) {
  const hasError = body?.message || body?.error || body?.errors;
  if (!hasError) {
    throw new Error(`Expected error message, but server returned: ${JSON.stringify(body)}`);
  }
}

module.exports = { createNewUser, IdDoesntExist, expectErrorBody };