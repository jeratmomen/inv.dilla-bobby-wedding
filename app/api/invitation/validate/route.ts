import { db, failure } from "@/lib/server";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const name = (url.searchParams.get("to") || "").trim();

    if (!name || name.length > 160) {
      return Response.json(
        { valid: false },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    const guest = await db()
      .prepare("SELECT id FROM guests WHERE name = ? LIMIT 1")
      .bind(name)
      .first<{ id: string }>();

    return Response.json(
      { valid: Boolean(guest) },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    return failure(error);
  }
}
