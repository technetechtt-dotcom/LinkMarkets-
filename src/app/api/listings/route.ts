import { ListingStatus } from "@prisma/client";
import { ZodError } from "zod";
import { json, parsePlatforms, serializePlatforms, zodError } from "@/lib/api";
import { auth, requireUser } from "@/lib/auth";
import { canCreateListing } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { listingSchema } from "@/lib/validation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim().toLowerCase();
  const kind = searchParams.get("kind");
  const platform = searchParams.get("platform");
  const mine = searchParams.get("mine") === "1";

  const session = await auth();
  const where: Record<string, unknown> = {};

  if (mine) {
    if (!session?.user?.id) return json({ error: "Unauthorized" }, 401);
    where.ownerId = session.user.id;
  } else {
    where.status = ListingStatus.ACTIVE;
  }

  if (kind === "motorcycle" || kind === "car" || kind === "ev" || kind === "charger") {
    where.kind = kind;
  }

  const listings = await prisma.listing.findMany({
    where,
    include: {
      owner: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const filtered = listings.filter((l) => {
    const platforms = parsePlatforms(l.platforms);
    if (platform && platform !== "all" && !platforms.includes(platform)) {
      return false;
    }
    if (!q) return true;
    const hay = [l.make, l.city, l.province, l.owner.name, ...platforms]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });

  return json({
    listings: filtered.map((l) => ({
      ...l,
      platforms: parsePlatforms(l.platforms),
    })),
  });
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    if (!canCreateListing(user)) {
      return json(
        { error: "Owner role required to create listings. Register as owner or contact admin." },
        403,
      );
    }

    const rl = rateLimit(clientKey(request, `listing-create:${user.id}`), 20, 60_000);
    if (!rl.ok) return json({ error: "Rate limit exceeded" }, 429);

    const body = await request.json();
    const data = listingSchema.parse(body);

    const listing = await prisma.listing.create({
      data: {
        ownerId: user.id,
        kind: data.kind,
        make: data.make,
        city: data.city,
        province: data.province,
        price: data.price,
        period: data.period,
        platforms: serializePlatforms(data.platforms),
        description: data.description,
        phone: data.phone,
        imageUrl: data.imageUrl || null,
        condition: data.condition,
        mileageKm:
          data.kind !== "charger" && data.condition === "used"
            ? data.mileageKm ?? null
            : null,
        // New listings require admin approval in production workflow
        status: user.role === "ADMIN" ? "ACTIVE" : "PENDING",
      },
    });

    return json(
      { listing: { ...listing, platforms: parsePlatforms(listing.platforms) } },
      201,
    );
  } catch (error) {
    if (error instanceof Response) return error;
    if (error instanceof ZodError) return zodError(error);
    console.error(error);
    return json({ error: "Could not create listing" }, 500);
  }
}
