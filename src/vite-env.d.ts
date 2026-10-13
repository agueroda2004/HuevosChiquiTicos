/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLERK_PUBLISHABLE_KEY: string;
  readonly VITE_DATA_SOURCE: "dev" | "production";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
