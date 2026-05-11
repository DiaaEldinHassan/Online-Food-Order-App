import { z } from "zod";

export const updateOrderStatusSchema = z.object({
  status: z.enum(["placed", "preparing", "out-for-delivery", "delivered", "cancelled"])
});
