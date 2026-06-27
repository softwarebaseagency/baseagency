import { handleZktecoIclock, requestToIclockInput } from "@/lib/zkteco-iclock";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: {
    action: string;
  };
};

async function handle(request: Request, { params }: RouteContext) {
  const input = await requestToIclockInput(request, `/iclock/${params.action}`);
  return handleZktecoIclock(input);
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
