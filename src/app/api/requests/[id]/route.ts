import { json, parsePlatforms } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const item = await prisma.rentalRequest.findUnique({
    where: { id },
    include: {
      requester: { select: { id: true, name: true } },
      replies: {
        include: { owner: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!item) return json({ error: "Not found" }, 404);
  return json({ request: { ...item, platforms: parsePlatforms(item.platforms) } });
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const item = await prisma.rentalRequest.findUnique({ where: { id } });
    if (!item) return json({ error: "Not found" }, 404);
    if (item.requesterId !== user.id && user.role !== "ADMIN") {
      return json({ error: "Forbidden" }, 403);
    }

    const body = await request.json();
    const status = body.status;
    if (!["OPEN", "FULFILLED", "CLOSED"].includes(status)) {
      return json({ error: "Invalid status" }, 400);
    }

    const updated = await prisma.rentalRequest.update({
      where: { id },
      data: { status },
    });
    return json({ request: { ...updated, platforms: parsePlatforms(updated.platforms) } });
  } catch (error) {
    if (error instanceof Response) return error;
    return json({ error: "Update failed" }, 500);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const item = await prisma.rentalRequest.findUnique({ where: { id } });
    if (!item) return json({ error: "Not found" }, 404);
    if (item.requesterId !== user.id && user.role !== "ADMIN") {
      return json({ error: "Forbidden" }, 403);
    }
    await prisma.rentalRequest.update({
      where: { id },
      data: { status: "CLOSED" },
    });
    return json({ ok: true });
  } catch (error) {
    if (error instanceof Response) return error;
    return json({ error: "Delete failed" }, 500);
  }
}
