import { z } from "zod";

export const acceptMessagesSchema = z.object({
  acceptingMessage: z.boolean(),
});
