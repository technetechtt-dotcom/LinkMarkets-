import bcrypt from "bcryptjs";
import { ZodError } from "zod";
import { json, zodError } from "@/lib/api";
import { POPIA_VERSION } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { registerSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const rl = rateLimit(clientKey(request, "register"), 8, 60_000);
  if (!rl.ok) {
    return json({ error: "Too many registration attempts" }, 429);
  }

  try {
    const body = await request.json();
    const data = registerSchema.parse(body);
    const email = data.email.toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return json({ error: "Email already registered" }, 409);

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: data.name,
        phone: data.phone,
        role: data.role,
        canListVehicles: data.role === "OWNER",
        popiaConsentAt: new Date(),
        popiaVersion: POPIA_VERSION,
        consentLogs: {
          create: {
            version: POPIA_VERSION,
            purpose: "account_registration",
            ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        canListVehicles: true,
      },
    });

    return json({ user }, 201);
  } catch (error) {
    if (error instanceof ZodError) return zodError(error);
    console.error(error);
    return json({ error: "Registration failed" }, 500);
  }
}
