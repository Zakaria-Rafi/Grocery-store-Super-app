import { defineNuxtConfig } from "nuxt/config";
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  ssr: false,
  devtools: { enabled: true },
  css: [],
  modules: [
    "@nuxt/eslint",
    "@sidebase/nuxt-auth",
    "@nuxtjs/i18n",
    "shadcn-nuxt",
    "@nuxtjs/color-mode",
    "@nuxtjs/google-fonts",
    "@pinia/nuxt",
    "@nuxtjs/tailwindcss",
    "@nuxtjs/storybook",
  ],
  googleFonts: {
    families: {
      Poppins: true,
    },
  },
  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: "",
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: "@/components/ui",
  },
  i18n: {
    strategy: "no_prefix",
    locales: [
      { code: "fr", language: "fr-FR", file: "fr.json" },
      { code: "en", language: "en-US", file: "en.json" },
    ],
    defaultLocale: "fr",
    skipSettingLocaleOnNavigate: true,
  },
  auth: {
    defaultRoute: "/auth",
    pages: {
      login: "/auth",
    },
    redirects: {
      home: "/",
      login: "/auth",
      logout: "/auth",
    },
    isEnabled: true,
    baseURL: process.env.NUXT_AUTH_URL,
    originEnvKey: "NUXT_API_URL",
    globalAppMiddleware: {
      isEnabled: true,
    },
    provider: {
      type: "local",
      endpoints: {
        getSession: {
          path: "/me",
        },
        signIn: {
          path: "/login",
        },
        signOut: false,
      },
      session: {
        dataResponsePointer: "/",
        dataType: {
          id: "string | number",
          email: "string",
          firstName: "string",
          lastName: "string",
          role: "user | admin",
        },
      },
      token: {
        signInResponseTokenPointer: "/access_token",
      },
    },
    sessionRefresh: {
      enableOnWindowFocus: true,
      enablePeriodically: 20000,
    },
  },
  nitro: {
    compressPublicAssets: true,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
  build: {
    transpile: ["@heroicons/vue", "@headlessui/vue"],
  },
  imports: {
    dirs: ["composables/**"],
  },
  devServer: {
    port: 3000,
  },
  app: {
    head: {
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1",
    },
  },
});
