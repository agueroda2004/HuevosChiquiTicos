import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ClerkProvider } from "@clerk/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "@fontsource-variable/comfortaa";
import "./index.css";
import App from "./App.tsx";
import { AuthTokenBridge } from "./config/AuthTokenBridge.tsx";
import { env } from "./config/env.ts";
import { NotificationProvider } from "./shared/components/notifications/NotificationProvider.tsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider publishableKey={env.clerkPublishableKey}>
      <AuthTokenBridge />
      <QueryClientProvider client={queryClient}>
        <NotificationProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </NotificationProvider>
      </QueryClientProvider>
    </ClerkProvider>
  </StrictMode>,
);
