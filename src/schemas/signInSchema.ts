import { z } from "zod";

export const signInSchema = z.object({
  identifier: z
    .string()
    .email({ message: "Please provide a valid email" })
    .min(3, "Email must be at least 3 characters long")
    .max(100, "Email must be at most 100 characters long"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});
