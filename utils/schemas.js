const { z } = require("zod");


const authSchema = z.object({
  status: z.string(),
  data: z.object({
    access_token: z.string().min(1),
    user: z.object({
      id: z.string(),
      email: z.string(),
    }).passthrough() 
  })
});

const profileSchema = z.object({
  status: z.string(),
  data: z.object({
    id: z.string(),
    email: z.string(),
    name: z.string(),
    profile: z.object({
      first_name: z.string(),
      last_name: z.string(),
    }).passthrough()
  }).passthrough()
});


const avatarSchema = z.object({
  status: z.string(),
  data: z.array(
    z.object({
      name: z.string(),
      url: z.string(),
      size: z.number(),
    }).passthrough()
  )
});


const errorSchema = z.object({
  message: z.string().min(1),
}).passthrough();  // allows extra fields like status_code


function validateSchema(schema, data) {
  const result = schema.safeParse(data);
  return {
    valid: result.success,
    errors: result.success ? null : result.error.issues.map(e => `${e.path.join(".")}: ${e.message}`).join(", "),
  };
}

module.exports = {
  schemas: {
    auth: authSchema,
    profile: profileSchema,
    avatar: avatarSchema,
    error: errorSchema,
  },
  validateSchema,
};