// GET /mobileconfig
// Generates an Apple configuration profile so iPhone / iPad / Mac can use the NextDNS profile
// with one tap (DNS-over-HTTPS). The profile ID comes from the NEXTDNS_PROFILE_ID variable.
export function onRequestGet({ env }) {
  const id = env.NEXTDNS_PROFILE_ID;
  if (!id || !/^[a-z0-9]{3,16}$/i.test(id)) {
    return new Response('NEXTDNS_PROFILE_ID is not configured', { status: 503 });
  }

  // Fixed UUIDs, so re-installing replaces the profile instead of adding a duplicate.
  const DNS_UUID = '6F1D2B9A-3C4E-4A57-9B8E-1A2B3C4D5E6F';
  const PROFILE_UUID = '8A7C5E3D-1B2F-4C6A-A9D0-0F1E2D3C4B5A';

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>PayloadContent</key>
  <array>
    <dict>
      <key>DNSSettings</key>
      <dict>
        <key>DNSProtocol</key><string>HTTPS</string>
        <key>ServerURL</key><string>https://dns.nextdns.io/${id}</string>
      </dict>
      <key>PayloadDescription</key><string>Routes DNS through your NextDNS profile</string>
      <key>PayloadDisplayName</key><string>BMITADBLOCKER DNS (${id})</string>
      <key>PayloadIdentifier</key><string>dev.pages.bmitadblocker.dns.${DNS_UUID}</string>
      <key>PayloadType</key><string>com.apple.dnsSettings.managed</string>
      <key>PayloadUUID</key><string>${DNS_UUID}</string>
      <key>PayloadVersion</key><integer>1</integer>
    </dict>
  </array>
  <key>PayloadDescription</key><string>BMITADBLOCKER ad and tracker blocking</string>
  <key>PayloadDisplayName</key><string>BMITADBLOCKER</string>
  <key>PayloadIdentifier</key><string>dev.pages.bmitadblocker.${PROFILE_UUID}</string>
  <key>PayloadRemovalDisallowed</key><false/>
  <key>PayloadType</key><string>Configuration</string>
  <key>PayloadUUID</key><string>${PROFILE_UUID}</string>
  <key>PayloadVersion</key><integer>1</integer>
</dict>
</plist>
`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/x-apple-aspen-config; charset=utf-8',
      'Content-Disposition': 'attachment; filename="bmitadblocker.mobileconfig"',
      'Cache-Control': 'no-store',
    },
  });
}
