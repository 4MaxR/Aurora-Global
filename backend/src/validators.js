import { z } from "zod";

export const quoteSchema = z.object({
  fullName: z.string().min(2).max(80),
  company: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().min(7).max(30),
  shipmentType: z.enum(["Ocean", "Air", "Road", "Customs", "Warehousing", "ProjectCargo"]),
  tradeLane: z.string().min(2).max(120),
  message: z.string().min(10).max(2000)
});

export const trackRefSchema = z.string().min(3).max(40);
