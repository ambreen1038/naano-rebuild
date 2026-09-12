import { NextResponse } from "next/server";

// Discovery stub for the URL shown under Settings -> Integrations. A full
// remote MCP server (OAuth 2.1, tool-calling against live workspace data)
// is a separate, much larger project than this endpoint — this route
// exists so the "Copy MCP URL" action points at something real and
// resolvable rather than a dead link, and honestly describes what isn't
// implemented yet instead of pretending to be a working tool-call surface.
export async function GET() {
  return NextResponse.json({
    name: "naano-mcp",
    status: "not_implemented",
    message:
      "This endpoint is a placeholder. Naano's remote MCP server (tool-calling over creators, campaigns and bookings) is not implemented in this build.",
  });
}
