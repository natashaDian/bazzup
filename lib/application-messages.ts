// Plain constants shared between server code (the apply action) and client
// components (the apply button) - kept out of lib/bazaars.ts because that
// file is "server-only" and cannot be imported from a Client Component.
export const ALREADY_APPLIED_MESSAGE =
  "You already have an active application for this area.";

export const SLOT_SOLD_OUT_MESSAGE =
  "Sold out - all slots for this area are already taken.";
