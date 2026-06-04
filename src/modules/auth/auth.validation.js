const { z } = require("zod");

const loginSchema = z.object({
    body: z.object({
        email: z.string().email(),
        password: z.string().min(6),
    }),
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});

const registerSchema = z.object({
    body: z.object({
        name: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(6),
    }),
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});

module.exports = {
    loginSchema,
    registerSchema,
};
