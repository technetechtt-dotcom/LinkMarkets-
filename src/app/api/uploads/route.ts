import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { json } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { canCreateListing } from "@/lib/ownership";
import { clientKey, rateLimit } from "@/lib/rate-limit";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    if (!canCreateListing(user) && user.role !== "DRIVER") {
      // Drivers may still upload if they later get owner rights; keep owner-focused
    }

    const rl = rateLimit(clientKey(request, `upload:${user.id}`), 20, 60_000);
    if (!rl.ok) return json({ error: "Rate limit exceeded" }, 429);

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return json({ error: "file required" }, 400);
    if (!ALLOWED.has(file.type)) {
      return json({ error: "Only JPEG, PNG or WebP allowed" }, 400);
    }
    if (file.size > MAX_BYTES) {
      return json({ error: "Max file size is 5MB" }, 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const optimized = await sharp(buffer)
      .rotate()
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();

    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    const filename = `${Date.now()}-${randomUUID()}.webp`;
    await writeFile(path.join(dir, filename), optimized);

    const url = `/uploads/${filename}`;
    return json({ url }, 201);
  } catch (error) {
    if (error instanceof Response) return error;
    console.error(error);
    return json({ error: "Upload failed" }, 500);
  }
}
