import { NextResponse } from "next/server";
import { handleZktecoIclock } from "@/lib/zkteco-iclock";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: {
    path: string[];
  };
};

function authorized(request: Request) {
  const expected = process.env.BRIDGE_SECRET || process.env.ZK_BRIDGE_SECRET;
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : "";
  return Boolean(expected && token && token === expected);
}

async function handle(request: Request, { params }: RouteContext) {
  if (!authorized(request)) {
    return new NextResponse("Unauthorized", { status: 401, headers: { "content-type": "text/plain; charset=utf-8" } });
  }

  const url = new URL(request.url);
  const rawBody = request.method === "GET" ? "" : await request.text();
  const forwardedPath = `/${params.path.join("/")}`;

  return handleZktecoIclock({
    method: request.method.toUpperCase(),
    pathname: forwardedPath,
    searchParams: url.searchParams,
    headers: Object.fromEntries(request.headers.entries()),
    rawBody,
    remoteAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null
  });
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
