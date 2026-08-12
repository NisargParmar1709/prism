import { createClient } from '@insforge/sdk';

/**
 * InsForge client singleton for the Prism frontend.
 *
 * - Auth settings are managed by the SDK (autoRefreshToken, persistSession via httpOnly cookies).
 * - NEVER store tokens in localStorage — the SDK uses httpOnly cookies by default.
 */
export const insforge = createClient({
  baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
  anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
});
