import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSignIn } from "@clerk/react";

import type { LoginCredentials, LoginStep } from "../domain/auth";
import type { LoginPort } from "../domain/auth.ports";

const GENERIC_ERROR = "No pudimos iniciar sesión. Inténtalo de nuevo.";
const INVALID_CODE = "El código es incorrecto o ha caducado.";

export function useLogin(): LoginPort {
  const { signIn, fetchStatus } = useSignIn();
  const navigate = useNavigate();
  const [step, setStep] = useState<LoginStep>("credentials");
  const [error, setError] = useState<string | null>(null);

  const finalize = useCallback(async () => {
    await signIn.finalize({
      navigate: ({ decorateUrl }) => {
        const url = decorateUrl("/");
        if (url.startsWith("http")) {
          window.location.href = url;
          return;
        }
        navigate(url);
      },
    });
  }, [signIn, navigate]);

  const submitCredentials = useCallback(
    async ({ email, password }: LoginCredentials) => {
      setError(null);

      const { error: signInError } = await signIn.password({
        emailAddress: email,
        password,
      });

      if (signInError) {
        setError(GENERIC_ERROR);
        return;
      }

      if (signIn.status === "complete") {
        await finalize();
        return;
      }

      if (signIn.status === "needs_second_factor" || signIn.status === "needs_client_trust") {
        const { error: sendError } = await signIn.mfa.sendEmailCode();
        if (sendError) {
          setError(GENERIC_ERROR);
          return;
        }
        setStep("verification");
        return;
      }

      setError(GENERIC_ERROR);
    },
    [signIn, finalize],
  );

  const verifyCode = useCallback(
    async (code: string) => {
      setError(null);

      const { error: verifyError } = await signIn.mfa.verifyEmailCode({ code });
      if (verifyError) {
        setError(INVALID_CODE);
        return;
      }

      if (signIn.status === "complete") {
        await finalize();
        return;
      }

      setError(GENERIC_ERROR);
    },
    [signIn, finalize],
  );

  const resendCode = useCallback(async () => {
    setError(null);
    const { error: sendError } = await signIn.mfa.sendEmailCode();
    if (sendError) {
      setError(GENERIC_ERROR);
    }
  }, [signIn]);

  const reset = useCallback(() => {
    void signIn.reset();
    setStep("credentials");
    setError(null);
  }, [signIn]);

  return {
    step,
    isLoading: fetchStatus === "fetching",
    error,
    submitCredentials,
    verifyCode,
    resendCode,
    reset,
  };
}
