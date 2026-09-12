import { NextResponse } from "next/server";

// Served to brands' own external websites via
// <script async src=".../api/n.js" data-site="nn_...">. Deliberately
// resolves /api/track against its OWN script src (not a hardcoded domain),
// so the snippet works correctly no matter where this app is deployed.
const SCRIPT = `
(function () {
  var script = document.currentScript;
  var siteKey = script && script.getAttribute("data-site");
  var endpoint = script ? new URL("/api/track", script.src).toString() : null;

  function readRef() {
    var fromUrl = new URLSearchParams(location.search).get("naano_ref");
    if (fromUrl) {
      document.cookie = "naano_ref=" + encodeURIComponent(fromUrl) + ";path=/;max-age=2592000";
      return fromUrl;
    }
    var match = document.cookie.match(/(?:^|; )naano_ref=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  }

  function send(event, data) {
    if (!siteKey || !endpoint) return;
    var body = Object.assign({ site_key: siteKey, event: event, ref: readRef() }, data || {});
    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(function () {});
  }

  var queued = (window.naano && window.naano.q) || [];
  window.naano = function (event, data) {
    send(event, data);
  };
  queued.forEach(function (args) {
    send(args[0], args[1]);
  });

  send("pageview", { path: location.pathname });
})();
`;

export async function GET() {
  return new NextResponse(SCRIPT, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
