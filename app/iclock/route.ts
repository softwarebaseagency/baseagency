import { handleZktecoIclock, requestToIclockInput } from "@/lib/zkteco-iclock";

export const dynamic = "force-dynamic";

async function handle(request: Request) {
  const input = await requestToIclockInput(request, "/iclock");
  return handleZktecoIclock(input);
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
