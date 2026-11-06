// Next.js runs in Node, where the Cloudflare Workers runtime module is unavailable.
export const env = process.env as unknown as Record<string, unknown>;
