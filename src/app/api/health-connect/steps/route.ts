import { authenticateStepDevice, importDeviceSteps, revokeDeviceToken } from "@/lib/step-sync/service";
import { readSyncJSON } from "@/lib/step-sync/protocol";
import { revalidatePath } from "next/cache";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store" };
export async function POST(request: Request) {
  try {
    const device = await authenticateStepDevice(request);
    if (!device?.tokenHash) return Response.json({ error: "Pair this device in Athanor first." }, { status: 401, headers });
    let value: unknown;
    try { value = await readSyncJSON(request); } catch { return Response.json({ error: "Invalid sync request." }, { status: 400, headers }); }
    const result = await importDeviceSteps(device.tokenHash, value);
    if (result.status === 200) for (const path of ["/steps", "/", "/steps/connect"]) revalidatePath(path);
    return Response.json(result, { status: result.status, headers });
  } catch { return Response.json({ error: "Sync could not be confirmed. Retry safely." }, { status: 503, headers }); }
}
export async function DELETE(request: Request) {
  try {
    const device = await authenticateStepDevice(request);
    if (!device?.tokenHash) return Response.json({ error: "Device is not paired." }, { status: 401, headers });
    await revokeDeviceToken(device.tokenHash); revalidatePath("/steps/connect");
    return Response.json({ disconnected: true }, { headers });
  } catch { return Response.json({ error: "Disconnect could not be confirmed. Retry or disconnect on the website." }, { status: 503, headers }); }
}
