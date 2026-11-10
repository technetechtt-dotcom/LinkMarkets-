import { ZodError } from "zod";
import { json, parsePlatforms, serializePlatforms, zodError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { canManageListing } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { listingSchema } from "@/lib/validation";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { owner: { select: { id: true, name: true } } },
  });
  if (!listing || listing.status === "REMOVED") {
    return json({ error: "Not found" }, 404);
  }
  return json({ listing: { ...listing, platforms: parsePlatforms(listing.platforms) } });
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) return json({ error: "Not found" }, 404);
    if (!canManageListing(user, listing)) return json({ error: "Forbidden" }, 403);

    const rl = rateLimit(clientKey(request, `listing-edit:${user.id}`), 40, 60_000);
    if (!rl.ok) return json({ error: "Rate limit exceeded" }, 429);

    const body = await request.json();

    if (body.action === "pause" || body.action === "activate") {
      if (listing.status === "REMOVED" || listing.status === "REJECTED") {
        return json({ error: "Listing cannot be toggled" }, 400);
      }
      const updated = await prisma.listing.update({
        where: { id },
        data: {
          status: body.action === "pause" ? "PAUSED" : "ACTIVE",
        },
      });
      return json({ listing: { ...updated, platforms: parsePlatforms(updated.platforms) } });
    }

    const data = listingSchema.parse(body);
    const updated = await prisma.listing.update({
      where: { id },
      data: {
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
        status: user.role === "ADMIN" ? listing.status : "PENDING",
      },
    });

    return json({ listing: { ...updated, platforms: parsePlatforms(updated.platforms) } });
  } catch (error) {
    if (error instanceof Response) return error;
    if (error instanceof ZodError) return zodError(error);
    console.error(error);
    return json({ error: "Update failed" }, 500);
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) return json({ error: "Not found" }, 404);
    if (!canManageListing(user, listing)) return json({ error: "Forbidden" }, 403);

    const rl = rateLimit(clientKey(request, `listing-del:${user.id}`), 20, 60_000);
    if (!rl.ok) return json({ error: "Rate limit exceeded" }, 429);

    await prisma.listing.update({
      where: { id },
      data: { status: "REMOVED" },
    });
    return json({ ok: true });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error(error);
    return json({ error: "Delete failed" }, 500);
  }
}
