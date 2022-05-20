import { NuxtModule } from '@nuxt/schema'
declare module '@nuxt/schema' {
  interface NuxtConfig {
    ["telemetry"]?: typeof import("@nuxt/telemetry").default extends NuxtModule<infer O> ? Partial<O> : Record<string, any>
  }
  interface RuntimeConfig {
     appURL: string,

    apiURL: string,

    oldAppURL: string,

    public: {
        appURL: string,

        apiURL: string,

        oldAppURL: string,
    },

    app: {
        baseURL: string,

        buildAssetsDir: string,

        cdnURL: string,
    },
  }
}