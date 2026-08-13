export default async function(req: Request): Promise<Response> {
  const BACKEND_URL = Deno.env.get("FASTAPI_BACKEND_URL");
  const CRON_SECRET = Deno.env.get("CRON_SECRET");

  if (!BACKEND_URL) {
    return new Response(JSON.stringify({ error: "FASTAPI_BACKEND_URL is not set" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  if (!CRON_SECRET) {
    return new Response(JSON.stringify({ error: "CRON_SECRET is not set" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    // Construct the URL to our FastAPI backend's internal generation endpoint
    const url = new URL("/recurring-rules/internal/generate", BACKEND_URL);
    url.searchParams.set("secret", CRON_SECRET);

    const res = await fetch(url.toString(), {
      method: "POST",
    });

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw_response: text };
    }

    return new Response(JSON.stringify({
      success: res.ok,
      status: res.status,
      data: data
    }), { 
      status: 200, // Always return 200 to InsForge cron, but include the actual status in body
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ 
      error: "Failed to trigger backend", 
      details: String(err) 
    }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
