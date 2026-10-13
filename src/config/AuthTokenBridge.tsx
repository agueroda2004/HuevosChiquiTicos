import { useEffect } from "react";
import { useAuth } from "@clerk/react";

import { setAuthTokenGetter } from "./auth-token";

export function AuthTokenBridge() {
  const { getToken } = useAuth();

  useEffect(() => {
    setAuthTokenGetter(getToken);
    return () => setAuthTokenGetter(null);
  }, [getToken]);

  return null;
}
