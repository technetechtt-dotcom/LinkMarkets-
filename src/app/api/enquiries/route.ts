import { ZodError } from "zod";
import { json, zodError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { sendNotificationEmail } from "@/lib/mail";
import { prisma } from "@/lib/prisma";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { enquirySchema } from "@/lib/validation";

export async function GET() {
  try {
    const user = await requireUser();
    const owned = await prisma.listing.findMany({
      where: { ownerId: user.id },
      select: { id: true },
    });
    const ids = owned.map((l) => l.id);
    const enquiries = await prisma.enquiry.findMany({
      where: {
        OR: [{ fromUserId: user.id }, { listingId: { in: ids } }],
      },
      include: {
        listing: { select: { id: true, make: true, city: true, ownerId: true } },
        fromUser: { select: { id: true, name: true, phone: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return json({ enquiries });
  } catch (error) {
    if (error instanceof Response) return error;
    return json({ error: "Failed to load enquiries" }, 500);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const rl = rateLimit(clientKey(request, `enquiry:${user.id}`), 15, 60_000);
    if (!rl.ok) return json({ error: "Rate limit exceeded" }, 429);

    const data = enquirySchema.parse(await request.json());
    const listing = await prisma.listing.findUnique({
      where: { id: data.listingId },
      include: { owner: true },
    });
    if (!listing || listing.status !== "ACTIVE") {
      return json({ error: "Listing not available" }, 404);
    }
    if (listing.ownerId === user.id) {
      return json({ error: "Cannot enquire on your own listing" }, 400);
    }

    const enquiry = await prisma.enquiry.create({
      data: {
        listingId: listing.id,
        fromUserId: user.id,
        message: data.message,
      },
    });

    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const notify = await sendNotificationEmail({
      userId: listing.ownerId,
      to: listing.owner.email,
      subject: `New enquiry for ${listing.make}`,
      text: [
        `Hi ${listing.owner.name},`,
        "",
        `${user.name} (${user.email}) sent an enquiry about your listing "${listing.make}" in ${listing.city}.`,
        "",
        data.message,
        "",
        `Driver phone: ${(await prisma.user.findUnique({ where: { id: user.id } }))?.phone || "n/a"}`,
        `Open listing: ${appUrl}/listings/${listing.id}`,
        "",
        "FleetMarket SA — you received this because you own this listing.",
      ].join("\n"),
    });

    await prisma.enquiry.update({
      where: { id: enquiry.id },
      data: {
        notifiedAt: notify.delivered ? new Date() : null,
        notifyError: notify.delivered ? null : notify.error || "notification failed",
      },
    });

    return json({ enquiry, notified: notify.delivered }, 201);
  } catch (error) {
    if (error instanceof Response) return error;
    if (error instanceof ZodError) return zodError(error);
    console.error(error);
    return json({ error: "Enquiry failed" }, 500);
  }
}
