import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL || "admin@fleetmarket.sa").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "ChangeMeAdmin123!";
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.retentionPolicy.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      enquiryDays: Number(process.env.DATA_RETENTION_ENQUIRY_DAYS || 365),
      reportDays: 730,
      notificationDays: 90,
      inactiveUserDays: 1095,
    },
  });

  await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role: "ADMIN",
      canListVehicles: true,
      name: process.env.ADMIN_NAME || "FleetMarket Admin",
      phone: process.env.ADMIN_PHONE || "0800000000",
      popiaConsentAt: new Date(),
      popiaVersion: process.env.POPIA_POLICY_VERSION || "2026-11-01",
    },
    create: {
      email,
      passwordHash,
      role: "ADMIN",
      canListVehicles: true,
      name: process.env.ADMIN_NAME || "FleetMarket Admin",
      phone: process.env.ADMIN_PHONE || "0800000000",
      popiaConsentAt: new Date(),
      popiaVersion: process.env.POPIA_POLICY_VERSION || "2026-11-01",
    },
  });

  // Production-safe default: NO fictional marketplace listings.
  if (process.env.SEED_DEMO === "true" && process.env.NODE_ENV !== "production") {
    console.log("SEED_DEMO=true — skipping fictional listings by design preference; create real data via UI.");
  } else {
    console.log("Production seed policy: no demo listings created.");
  }

  console.log(`Admin ready: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
