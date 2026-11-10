export const PLATFORMS = [
  "Uber",
  "Bolt",
  "inDrive",
  "Maxim",
  "Mr D",
  "Checkers Sixty60",
  "Debonairs",
  "Other delivery",
] as const;

export const PROVINCES = [
  "Northern Cape",
  "Eastern Cape",
  "Western Cape",
  "Free State",
  "Gauteng",
  "North West",
  "Limpopo",
  "Mpumalanga",
  "KwaZulu-Natal",
] as const;

export const POPIA_VERSION =
  process.env.POPIA_POLICY_VERSION || "2026-11-01";

export const APP_NAME = "FleetMarket SA";
