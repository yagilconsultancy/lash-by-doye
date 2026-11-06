import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig = {
  webpack(config: { resolve: { alias: Record<string, string | false> } }) {
    if (process.env.NEXT_PHASE) {
      config.resolve.alias["cloudflare:workers"] = path.join(projectRoot, "lib/cloudflare-workers-node.ts");
    }
    return config;
  },
};

export default nextConfig;
