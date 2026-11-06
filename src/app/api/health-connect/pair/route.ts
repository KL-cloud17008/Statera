import { claimStepSyncCode } from "@/lib/step-sync/service";
import { readSyncJSON } from "@/lib/step-sync/protocol";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store" };
export async function POST(request: Request) {
  let value: unknown;
  try { value = await readSyncJSON(request); } catch { return Response.json({ error: "Invalid pairing request." }, { status: 400, headers }); }
  try {
    const result = await claimStepSyncCode(value);
    return result ? Response.json(result, { headers }) : Response.json({ error: "Code expired or already used. Create a new code in Athanor." }, { status: 401, headers });
  } catch { return Response.json({ error: "Pairing temporarily unavailable. Please retry." }, { status: 503, headers }); }
}
