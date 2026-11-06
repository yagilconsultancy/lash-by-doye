import { bindings, defineConfig, defineWorker } from "cf/config";

export default defineConfig({
  worker: defineWorker({
    name: "lash-by-doye",
    entrypoint: "vinext/server/fetch-handler",
    compatibilityDate: "2026-11-06",
    workersDev: false,
    previewUrls: false,
    compatibilityFlags: ["nodejs_compat", "nodejs_compat_populate_process_env"],
    assets: {
      htmlHandling: "none",
      notFoundHandling: "none",
      runWorkerFirst: ["/*", "!/_next/static/*", "!/*/_next/static/*"],
    },
    env: {
      ASSETS: bindings.assets(),
      NEXT_PUBLIC_SUPABASE_URL: bindings.secret(),
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: bindings.secret(),
      SUPABASE_SERVICE_ROLE_KEY: bindings.secret(),
      ADMIN_EMAIL: bindings.secret(),
      RESEND_API_KEY: bindings.secret(),
      RESEND_FROM_EMAIL: bindings.secret(),
      BOOKING_NOTIFICATION_EMAIL: bindings.secret(),
    },
  }),
});
