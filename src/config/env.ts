const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const dataSource = import.meta.env.VITE_DATA_SOURCE ?? "dev";
const apiUrl = import.meta.env.VITE_API_URL ?? "";

if (!clerkPublishableKey) {
  throw new Error(
    "Missing VITE_CLERK_PUBLISHABLE_KEY. Add it to your .env.local file.",
  );
}

export const env = {
  clerkPublishableKey,
  dataSource,
  apiUrl,
} as const;

export default env;
