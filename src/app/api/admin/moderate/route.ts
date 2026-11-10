import { ZodError } from "zod";
import { json, zodError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { adminModerationSchema } from "@/lib/validation";

export async function GET() {
  try {
    await requireAdmin();
    const [pendingListings, openReports, users, stats] = await Promise.all([
      prisma.listing.findMany({
        where: { status: "PENDING" },
        include: { owner: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "asc" },
        take: 50,
      }),
      prisma.abuseReport.findMany({
        where: { status: "OPEN" },
        include: { reporter: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "asc" },
        take: 50,
      }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          suspended: true,
          createdAt: true,
        },
      }),
      prisma.$transaction([
        prisma.listing.count(),
        prisma.listing.count({ where: { status: "ACTIVE" } }),
        prisma.rentalRequest.count({ where: { status: "OPEN" } }),
        prisma.abuseReport.count({ where: { status: "OPEN" } }),
        prisma.user.count(),
      ]),
    ]);

    return json({
      pendingListings,
      openReports,
      users,
      stats: {
        listings: stats[0],
        activeListings: stats[1],
        openRequests: stats[2],
        openReports: stats[3],
        users: stats[4],
      },
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return json({ error: "Admin load failed" }, 500);
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    const rl = rateLimit(clientKey(request, `admin:${admin.id}`), 60, 60_000);
    if (!rl.ok) return json({ error: "Rate limit exceeded" }, 429);

    const data = adminModerationSchema.parse(await request.json());

    switch (data.action) {
      case "approve_listing":
        await prisma.listing.update({
          where: { id: data.listingId },
          data: { status: "ACTIVE" },
        });
        break;
      case "reject_listing":
        await prisma.listing.update({
          where: { id: data.listingId },
          data: { status: "REJECTED" },
        });
        break;
      case "remove_listing":
        await prisma.listing.update({
          where: { id: data.listingId },
          data: { status: "REMOVED" },
        });
        break;
      case "pause_listing":
        await prisma.listing.update({
          where: { id: data.listingId },
          data: { status: "PAUSED" },
        });
        break;
      case "dismiss_report":
        await prisma.abuseReport.update({
          where: { id: data.reportId },
          data: { status: "DISMISSED", adminNote: data.note },
        });
        break;
      case "action_report":
        await prisma.abuseReport.update({
          where: { id: data.reportId },
          data: { status: "ACTIONED", adminNote: data.note },
        });
        break;
      case "suspend_user":
        await prisma.user.update({
          where: { id: data.userId },
          data: { suspended: true },
        });
        break;
      case "unsuspend_user":
        await prisma.user.update({
          where: { id: data.userId },
          data: { suspended: false },
        });
        break;
      default:
        return json({ error: "Unknown action" }, 400);
    }

    return json({ ok: true });
  } catch (error) {
    if (error instanceof Response) return error;
    if (error instanceof ZodError) return zodError(error);
    console.error(error);
    return json({ error: "Moderation failed" }, 500);
  }
}
