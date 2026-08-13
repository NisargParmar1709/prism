// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const API_URL = Deno.env.get("API_URL") || "http://localhost:8000";
const CRON_SECRET = Deno.env.get("CRON_SECRET") || "super-secret-cron-key";

serve(async (req) => {
  console.log("Cron job triggered: generate-transactions");

  try {
    const response = await fetch(`${API_URL}/recurring-rules/internal/generate?secret=${CRON_SECRET}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Failed to generate transactions: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.error(text);
      return new Response(JSON.stringify({ error: "Failed to trigger generation", details: text }), { 
        status: response.status,
        headers: { "Content-Type": "application/json" }
      });
    }

    const data = await response.json();
    console.log(`Successfully generated ${data.generated} transactions.`);
    
    return new Response(
      JSON.stringify(data),
      { headers: { "Content-Type": "application/json" } },
    )
  } catch (error) {
    console.error("Error connecting to backend API", error);
    return new Response(JSON.stringify({ error: "Connection error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
})
