import { ZodError } from "zod";
import { json, zodError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { reportSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const rl = rateLimit(clientKey(request, `report:${user.id}`), 10, 60_000);
    if (!rl.ok) return json({ error: "Rate limit exceeded" }, 429);

    const data = reportSchema.parse(await request.json());

    const report = await prisma.abuseReport.create({
      data: {
        reporterId: user.id,
        targetType: data.targetType,
        targetId: data.targetId,
        reason: data.reason,
        details: data.details,
        listingId: data.targetType === "LISTING" ? data.targetId : null,
        requestId: data.targetType === "REQUEST" ? data.targetId : null,
      },
    });

    return json({ report }, 201);
  } catch (error) {
    if (error instanceof Response) return error;
    if (error instanceof ZodError) return zodError(error);
    console.error(error);
    return json({ error: "Report failed" }, 500);
  }
}
