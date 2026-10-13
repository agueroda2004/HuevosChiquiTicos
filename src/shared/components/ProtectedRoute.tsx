import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@clerk/react";

import { FullScreenLoader } from "./FullScreenLoader";

export function ProtectedRoute() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <FullScreenLoader />;
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  return <Outlet />;
}
