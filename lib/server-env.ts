import "server-only";
import { env as cloudflareEnv } from "cloudflare:workers";

/** Read a secret or setting from Cloudflare Worker bindings, with a Node fallback for Next.js. */
export function getServerEnv(name: string): string | undefined {
  const value = (cloudflareEnv as unknown as Record<string, unknown>)[name];
  if (typeof value === "string" && value.length > 0) return value;
  return process.env[name];
}
