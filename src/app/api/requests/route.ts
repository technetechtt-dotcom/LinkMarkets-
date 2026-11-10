import { ZodError } from "zod";
import { json, parsePlatforms, serializePlatforms, zodError } from "@/lib/api";
import { auth, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { requestSchema } from "@/lib/validation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const kind = searchParams.get("kind");
  const mine = searchParams.get("mine") === "1";
  const session = await auth();

  const where: Record<string, unknown> = {};
  if (mine) {
    if (!session?.user?.id) return json({ error: "Unauthorized" }, 401);
    where.requesterId = session.user.id;
  } else {
    where.status = "OPEN";
  }
  if (kind === "motorcycle" || kind === "car") where.kind = kind;

  const requests = await prisma.rentalRequest.findMany({
    where,
    include: {
      requester: { select: { id: true, name: true } },
      _count: { select: { replies: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return json({
    requests: requests.map((r) => ({
      ...r,
      platforms: parsePlatforms(r.platforms),
    })),
  });
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const rl = rateLimit(clientKey(request, `request-create:${user.id}`), 15, 60_000);
    if (!rl.ok) return json({ error: "Rate limit exceeded" }, 429);

    const data = requestSchema.parse(await request.json());
    const created = await prisma.rentalRequest.create({
      data: {
        requesterId: user.id,
        kind: data.kind,
        city: data.city,
        province: data.province,
        budgetMax: data.budgetMax ?? null,
        period: data.period,
        platforms: serializePlatforms(data.platforms),
        details: data.details,
        status: "OPEN",
      },
    });

    return json(
      { request: { ...created, platforms: parsePlatforms(created.platforms) } },
      201,
    );
  } catch (error) {
    if (error instanceof Response) return error;
    if (error instanceof ZodError) return zodError(error);
    console.error(error);
    return json({ error: "Could not create request" }, 500);
  }
}
