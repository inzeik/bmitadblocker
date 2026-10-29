// GET /api/config
// Tells the frontend whether NextDNS is configured, and which profile ID to display.
// (The profile ID is not secret: it is part of the public DNS address. The API key never leaves the server.)
export function onRequestGet({ env }) {
  const configured = Boolean(env.NEXTDNS_API_KEY && env.NEXTDNS_PROFILE_ID);
  return Response.json(
    { configured, profileId: configured ? env.NEXTDNS_PROFILE_ID : null },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
