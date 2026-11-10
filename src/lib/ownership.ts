import type { Listing, Role } from "@prisma/client";

export function canManageListing(
  user: { id: string; role: Role },
  listing: Pick<Listing, "ownerId">,
) {
  return user.role === "ADMIN" || listing.ownerId === user.id;
}

export function canCreateListing(user: {
  role: Role;
  canListVehicles: boolean;
}) {
  return (
    user.role === "ADMIN" ||
    user.role === "OWNER" ||
    user.canListVehicles === true
  );
}
