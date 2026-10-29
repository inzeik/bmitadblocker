// GET /api/<anything>  ->  https://api.nextdns.io/profiles/<PROFILE_ID>/<anything>
//
// This is a thin proxy. It adds the secret API key on the server side, so the key is never
// shipped to the browser. Only the read-only endpoints in ALLOWED can be reached.
const ALLOWED = /^(analytics\/(status|domains|devices)(;series)?|logs)$/;

export async function onRequestGet({ request, env, params }) {
  const { NEXTDNS_API_KEY, NEXTDNS_PROFILE_ID } = env;
  if (!NEXTDNS_API_KEY || !NEXTDNS_PROFILE_ID) {
    return Response.json({ error: 'NextDNS is not configured' }, { status: 503 });
  }

  const path = Array.isArray(params.path) ? params.path.join('/') : String(params.path);
  if (!ALLOWED.test(path)) {
    return Response.json({ error: 'Endpoint not allowed' }, { status: 403 });
  }

  const { search } = new URL(request.url);   // forwards ?from=-24h&limit=10 etc.
  const upstream = await fetch(
    `https://api.nextdns.io/profiles/${NEXTDNS_PROFILE_ID}/${path}${search}`,
    { headers: { 'X-Api-Key': NEXTDNS_API_KEY } },
  );

  return new Response(upstream.body, {
    status: upstream.status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}
