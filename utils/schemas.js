const Ajv = require("ajv");
const ajv = new Ajv({ allErrors: true });

//This schema is used for Login and registration

const authSchema = {
  type: "object",
  required: ["status", "data"],
  properties: {
    status: { type: "string" },
    data: {
      type: "object",
      required: ["access_token", "user"],
      properties: {
        access_token: { type: "string" },
        user: { type: "object" }
      }
    }
  }
};


const profileSchema = {
  type: "object",
  required: ["status", "data"],
  properties: {
    status: { type: "string" },
    data: {
      type: "object",
      properties: {
        schema: {
          type: "object",
          required: ["id", "email", "first_name", "last_name"]
        }
      }
    }
  }
};

// This is used to know the available avatar on zedu
const avatarSchema = {
  type: "object",
  required: ["status", "data"],
  properties: {
    status: { type: "string" },
    data: {
      type: "array",
      items: {
        type: "object",
        required: ["name", "url", "size"]
      }
    }
  }
};

 
const activitySchema = {
  type: "object",
  required: ["status", "data", "pagination"],
  properties: {
    status: { type: "string" },
    data: {
      type: "array",
      items: {
        type: "object",
        required: ["thread_id", "message", "username"]
      }
    },
    pagination: {
      type: "object",
      required: ["current_page", "total_pages"]
    }
  }
};

// This is used to catch errors and display a clear message of what went wrong
const errorSchema = {
  type: "object",
  required: ["message"],
  properties: {
    message: { type: "string" },
    status_code: { type: "number" }
  },
  additionalProperties: true
};

function validateSchema(schema, data) {
  const validate = ajv.compile(schema);
  const valid = validate(data);
  return {
    valid,
    errors: validate.errors ? ajv.errorsText(validate.errors) : null,
  };
}

module.exports = {
  schemas: {
    auth: authSchema,
    profile: profileSchema,
    avatar: avatarSchema,
    activity: activitySchema,
    error: errorSchema
  },
  validateSchema,
};