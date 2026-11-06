// Lets type checks pass before the Cloudflare types have been generated locally.
declare module "cloudflare:workers" {
  export const env: Record<string, unknown>;
}
