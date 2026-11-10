import { ZodError } from "zod";
import { json, zodError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { canCreateListing } from "@/lib/ownership";
import { sendNotificationEmail } from "@/lib/mail";
import { prisma } from "@/lib/prisma";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { requestReplySchema } from "@/lib/validation";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const user = await requireUser();
    if (!canCreateListing(user)) {
      return json({ error: "Only owners can reply to rental requests" }, 403);
    }

    const { id } = await params;
    const rl = rateLimit(clientKey(request, `req-reply:${user.id}`), 20, 60_000);
    if (!rl.ok) return json({ error: "Rate limit exceeded" }, 429);

    const parsed = requestReplySchema.parse({
      ...(await request.json()),
      requestId: id,
    });

    const rentalRequest = await prisma.rentalRequest.findUnique({
      where: { id },
      include: { requester: true },
    });
    if (!rentalRequest || rentalRequest.status !== "OPEN") {
      return json({ error: "Request not open" }, 404);
    }

    const reply = await prisma.requestReply.create({
      data: {
        requestId: id,
        ownerId: user.id,
        message: parsed.message,
      },
    });

    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const notify = await sendNotificationEmail({
      userId: rentalRequest.requesterId,
      to: rentalRequest.requester.email,
      subject: "An owner replied to your rental request",
      text: [
        `Hi ${rentalRequest.requester.name},`,
        "",
        `${user.name} replied to your vehicle request in ${rentalRequest.city}:`,
        "",
        parsed.message,
        "",
        `View request: ${appUrl}/requests/${id}`,
      ].join("\n"),
    });

    await prisma.requestReply.update({
      where: { id: reply.id },
      data: { notifiedAt: notify.delivered ? new Date() : null },
    });

    return json({ reply, notified: notify.delivered }, 201);
  } catch (error) {
    if (error instanceof Response) return error;
    if (error instanceof ZodError) return zodError(error);
    console.error(error);
    return json({ error: "Reply failed" }, 500);
  }
}
